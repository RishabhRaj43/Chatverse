import GroupChat from "../../Models/Chat/Group/GroupChat.model.js";
import Group from "../../Models/Group/Group.model.js";
import User from "../../Models/User/User.model.js";
import { OnlineUsers, SocketUsers } from "./UserSocket.controller.js";

export const OnlineGroupUsers = new Map();

export const sendOnlineGroupUsers = (io, socket, groupIds) => {
  if (!Array.isArray(groupIds)) groupIds = [groupIds];
  groupIds.map((groupId) => {
    groupId = groupId.toString();
    socket.emit("online-group-users", {
      groupId,
      onlineUsers: Array.from(OnlineGroupUsers?.get(groupId)),
    });
  });
};
export const sendOnlineGroupUsersLength = (io, socket, groupIds) => {
  if (!Array.isArray(groupIds)) groupIds = [groupIds];
  groupIds.map((groupId) => {
    groupId = groupId.toString();
    if (OnlineGroupUsers.has(groupId)) {
      io.to(socket.id).emit("online-group-users-length", {
        groupId,
        onlineUsers: Array.from(OnlineGroupUsers.get(groupId)).length,
      });
    }
  });
};

export const createGroup = async (io, socket, data) => {
  try {
    const {
      name,
      handle,
      description,
      members,
      memberToName,
      isPrivate,
      groupIcon,
    } = data.data;

    const userId = socket.currUser._id;

    if (!name || !handle || !description) {
      return socket.emit("create-group-error", {
        message: "All fields are required",
      });
    }

    const existingGroup = await Group.findOne({ handle });
    if (existingGroup) {
      return socket.emit("create-group-error", {
        message: "Group already exists",
      });
    }

    if (!members?.includes(userId)) {
      members.push(userId.toString());
    }

    const newGroup = new Group({
      name,
      handle,
      description,
      Admins: [userId],
      members,
      createdBy: userId,
      isPrivate: isPrivate || false,
      groupIcon: groupIcon || null,
    });

    await User.updateMany(
      { _id: { $in: members } },
      { $addToSet: { groups: newGroup._id } }
    );

    const groupId = newGroup._id.toString();
    if (!OnlineGroupUsers.has(groupId)) {
      OnlineGroupUsers.set(groupId, new Set());
    }
    OnlineGroupUsers.get(groupId).add(userId.toString());

    const newMemberToName = {
      ...memberToName,
    };

    let onlineMembers = [];
    for (const member of members) {
      const memberSocketId = SocketUsers.get(member);
      const memberSocket = io.sockets.sockets.get(memberSocketId);
      if (memberSocket) {
        onlineMembers.push(member);
        OnlineGroupUsers.get(groupId).add(member); // this will add like {groupId: [member1, member2]} and member1 and member2 are user._id
        memberSocket.join(groupId);
      }
    }

    const mainMessage = await GroupChat.create({
      groupId: newGroup._id,
      isNotification: true,
      message: `${socket.currUser.username} created the group!`,
      senderId: userId,
      messageType: "text",
      readBy: [userId],
      deliveredTo: Array.from(OnlineGroupUsers.get(groupId)),
    });

    const bulkOps = onlineMembers
      .filter((member) => member.toString() !== userId.toString())
      .map((member) => {
        return {
          insertOne: {
            document: {
              groupId: newGroup._id,
              isNotification: true,
              message: `${socket.currUser.username} added ${newMemberToName[member]}`,
              senderId: member,
              messageType: "text",
              deliveredTo: Array.from(OnlineGroupUsers.get(groupId)),
            },
          },
        };
      });

    const res = await GroupChat.bulkWrite(bulkOps);

    const groupMessages = Object.values(res.insertedIds);
    newGroup.messages = [...groupMessages, mainMessage._id];

    await newGroup.save();

    const latestMessage = {
      _id: groupMessages[groupMessages.length - 1],
      message: `${socket.currUser.username} created the group!`,
      messageType: "text",
      isNotification: true,
      createdAt: new Date(),
    };

    io.to(groupId).emit("added-to-group", {
      group: {
        _id: newGroup._id,
        name: newGroup.name,
        handle: newGroup.handle,
        groupIcon: newGroup.groupIcon,
        isPrivate: newGroup.isPrivate,
      },
      latestMessage,
      undeliveredCount: groupMessages.length,
    });

    io.emit("online-group-users-length", {
      groupId: newGroup._id,
      onlineUsers: Array.from(OnlineGroupUsers.get(groupId)).length,
      latestMessage,
    });

    socket.emit("create-group-success", { name });
  } catch (error) {
    console.error("Error in createGroup:", error);
    socket.emit("create-group-error", { message: error.message });
  }
};

export const joinGroup = async (io, socket, data) => {
  const {
    groupId,
    userId = socket.currUser._id,
    isPrivateAllowed = false,
    message,
  } = data;

  const group = await Group.findOne({ _id: groupId });
  if (!group) {
    return socket.emit("join-group-error", { message: "Group not found" });
  }

  if (group.members.includes(userId)) {
    return socket.emit("join-group-error", {
      message: "Already a member of this group",
    });
  }

  if (userId !== socket.currUser._id) {
    if (!group.Admins.includes(socket.currUser._id)) {
      return socket.emit("join-group-error", {
        message: "You do not have permission to add members.",
      });
    }
  } else if (!isPrivateAllowed && group.isPrivate) {
    return socket.emit("join-group-error", {
      message: "This group is private",
    });
  }

  await Promise.all([
    User.updateOne({ _id: userId }, { $addToSet: { groups: groupId } }),
    group.updateOne({ $addToSet: { members: userId } }),
  ]);

  // Create notification message
  const notificationMessage = new GroupChat({
    groupId,
    isNotification: true,
    message:
      message ||
      `${
        userId === socket.currUser._id ? socket.currUser.username : "A member"
      } joined the group`,
    senderId: userId,
    messageType: "text",
    deliveredTo: Array.from(OnlineGroupUsers.get(groupId) || []),
    readBy: [userId],
  });

  group.messages.push(notificationMessage._id);
  await Promise.all([group.save(), notificationMessage.save()]);

  const targetSocket = io.sockets.sockets.get(
    SocketUsers.get(userId.toString())
  );

  if (targetSocket) {
    targetSocket.join(groupId);
  }

  const groupUsers = OnlineGroupUsers.get(groupId.toString()) || new Set();
  groupUsers.add(userId.toString());
  OnlineGroupUsers.set(groupId.toString(), groupUsers);

  io.to(SocketUsers.get(userId.toString())).emit("joined-group-success", {
    group: {
      _id: group._id,
      name: group.name,
      handle: group.handle,
      groupIcon: group.groupIcon,
      isPrivate: group.isPrivate,
    },
    latestMessage: {
      _id: notificationMessage._id,
      message: notificationMessage.message,
      isNotification: true,
      messageType: notificationMessage.messageType,
      createdAt: notificationMessage.createdAt,
    },
    undeliveredCount: 1,
    successMessage: `${socket.currUser.username} added you to the group!`,
  });

  io.to(`${groupId}-group`).emit("new-group-message", {
    message: {
      ...notificationMessage._doc,
      _id: notificationMessage._id,
      deliveredTo: Array.from(OnlineGroupUsers.get(groupId)),
      readBy: [socket.currUser._id],
    },
  });

  socket.to(groupId).emit("new-group-notification", {
    groupId,
    latestMessage: {
      _id: notificationMessage._id,
      message: notificationMessage.message,
      createdAt: notificationMessage.createdAt,
      isNotification: true,
    },
  });

  io.emit("online-group-users-length", {
    groupId,
    onlineUsers: Array.from(OnlineGroupUsers.get(groupId) || []).length,
  });
};

export const sendGroupMessage = async (io, socket, data) => {
  const { groupId, message } = data;

  if (!socket.currUser.groups.includes(groupId)) return;

  const newMessage = new GroupChat({
    groupId,
    message: message.message,
    isDeleted: message.isDeleted,
    isNotification: message.isNotification,
    senderId: socket.currUser._id,
    messageType: message.messageType,
    deliveredTo: Array.from(OnlineGroupUsers.get(groupId)),
    readBy: [socket.currUser._id],
  });

  io.to(`${groupId}-group`).emit("new-group-message", {
    message: {
      ...message,
      _id: newMessage._id,
      deliveredTo: Array.from(OnlineGroupUsers.get(groupId)),
      readBy: [socket.currUser._id],
    },
  });

  socket.to(groupId).emit("new-group-notification", {
    groupId,
    latestMessage: {
      message: message.message,
      messageType: message.messageType,
      isNotification: false,
      senderName: socket.currUser.username,
      senderId: socket.currUser._id,
      createdAt: new Date(),
      _id: newMessage._id,
    },
  });

  await newMessage.save();
};

export const readGroupMessage = async (io, socket, data) => {
  try {
    const { groupId } = data;
    const unreadMessages = await GroupChat.find(
      {
        groupId: groupId,
        readBy: { $ne: socket.currUser._id },
      },
      { _id: 1, senderId: 1 }
    ).lean();

    await GroupChat.updateMany(
      {
        groupId: groupId,
        readBy: { $ne: socket.currUser._id },
      },
      {
        $addToSet: { readBy: socket.currUser._id },
      }
    );

    unreadMessages.length > 0 &&
      socket.emit("group-message-read", {
        unreadMessages,
        receiverId: socket.currUser._id,
      });
  } catch (error) {
    console.log("Error in readGroupMessage: ", error);
    socket.emit("read-group-message-error", { message: error.message });
  }
};

export const singleReadGroupMessage = async (io, socket, data) => {
  try {
    const { messageId, senderId = socket.currUser._id } = data;
    console.log("messageId: ", messageId, "senderId: ", senderId);
    await GroupChat.updateOne(
      { _id: messageId },
      {
        $addToSet: { readBy: socket.currUser._id },
      }
    );
    socket.to(SocketUsers.get(senderId)).emit("single-group-message-read", {
      messageId,
      receiverId: socket.currUser._id,
    });
  } catch (error) {
    console.log("Error in singleReadGroupMessage: ", error);
    socket.emit("single-read-group-message-error", { message: error.message });
  }
};

export const leaveGroup = async (io, socket, data) => {
  try {
    const { groupId } = data;

    const promises = [
      await Group.updateOne(
        { _id: groupId },
        { $pull: { members: socket.currUser._id, Admins: socket.currUser._id } }
      ),
      await User.updateOne(
        { _id: socket.currUser._id },
        { $pull: { groups: groupId } }
      ),
    ];

    await Promise.all(promises);

    const newMessage = new GroupChat({
      groupId,
      message: `${socket.currUser.username} have left the group`,
      isNotification: true,
      senderId: socket.currUser._id,
      messageType: "text",
      deliveredTo: Array.from(OnlineGroupUsers.get(groupId)),
      readBy: [socket.currUser._id],
    });
    OnlineGroupUsers.get(groupId)?.delete(socket.currUser._id.toString());

    io.to(`${groupId}-group`).emit("new-group-message", {
      message: {
        ...newMessage.toObject(),
        _id: newMessage._id,
        createdAt: new Date(),
        deliveredTo: Array.from(OnlineGroupUsers.get(groupId)),
        readBy: [socket.currUser._id],
      },
    });

    io.to(`${groupId}-group`).emit("left-group-member", {
      userId: socket.currUser._id,
    });

    io.to(groupId).emit("left-group-member-info", {
      groupId,
      memberId: socket.currUser._id,
      memberName: socket.currUser.username,
    });

    await newMessage.save();

    io.emit("online-group-users-length", {
      groupId,
      onlineUsers: Array.from(OnlineGroupUsers.get(groupId)).length,
    });

    io.to(groupId).emit("online-group-users", {
      onlineUsers: Array.from(OnlineGroupUsers.get(groupId)),
    });

    console.log("Socket rooms: ", socket.rooms);

    socket.leave(`${groupId}-group`);
    socket.leave(groupId);
    console.log("Socket rooms: ", socket.rooms);
  } catch (error) {
    console.log("Error in leaveGroup: ", error);

    socket.emit("leave-group-error", { message: error.message });
  }
};

export const joinRoomGroup = async (io, socket, data) => {
  const { groupId } = data;

  if (!socket.currUser.groups.includes(groupId)) return;

  socket.join(`${groupId}-group`);
};

export const leaveRoomGroup = async (io, socket, data) => {
  const { groupId } = data;
  socket.leave(`${groupId}-group`);
};
