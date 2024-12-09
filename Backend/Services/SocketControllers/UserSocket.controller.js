import GroupChat from "../../Models/Chat/Group/GroupChat.model.js";
import UserChat from "../../Models/Chat/User/UserChat.model.js";
import User from "../../Models/User/User.model.js";
import { OnlineGroupUsers } from "./GroupSocket.controller.js";

export const OnlineUsers = new Set();
export const SocketUsers = new Map();

export const userRefreshed = async (io, socket, data) => {
  try {
    SocketUsers.set(data, socket.id);
    OnlineUsers.add(data);
    socket?.currUser?.groups.forEach((groupId) => {
      groupId = groupId.toString();
      const groupUsers = OnlineGroupUsers.get(groupId) || new Set();
      groupUsers.add(data.toString());
      OnlineGroupUsers.set(groupId, groupUsers);
      io.emit("online-group-users", {
        groupId,
        onlineUsers: Array.from(OnlineGroupUsers.get(groupId)),
      });
      io.emit("online-group-users-length", {
        groupId,
        onlineUsers: Array.from(OnlineGroupUsers.get(groupId)).length,
      });
      socket.join(groupId);
    });

    await GroupChat.updateMany(
      {
        groupId: { $in: socket.currUser.groups },
        deliveredTo: { $ne: data },
      },
      {
        $addToSet: {
          deliveredTo: data,
        },
      }
    );

    await UserChat.updateMany(
      { receiverId: data, isDelivered: false, isBlocked: false },
      { $set: { isDelivered: true } }
    );

    for (const userId of OnlineUsers) {
      const userSocketId = SocketUsers.get(userId);
      if (
        !socket.currUser.blocked.includes(userId) &&
        userSocketId &&
        userId !== data
      ) {
        io.to(userSocketId).emit("undelivered-messages-updated", data);
      }
    }

    io.emit("online-users", Array.from(OnlineUsers));
  } catch (error) {
    console.log("Error in userRefreshed: ",error);
  }
};

export const requestOnlineUsers = (io, socket) => {
  socket.emit("online-users", Array.from(OnlineUsers));
};

export const sendMessage = async (io, socket, message) => {
  const receiverSocketId = SocketUsers.get(message.receiverId);
  const receiverUser = await User.findById(message.receiverId);
  const newMessage = new UserChat({
    senderId: message.senderId,
    receiverId: message.receiverId,
    message: message.message,
    createdAt: Date.now(),
    isRead: false,
    isDeleted: false,
    isBlocked: receiverUser.blocked.includes(message.senderId),
    messageType: message.messageType,
    isDelivered: false,
  });

  if (receiverSocketId && !newMessage.isBlocked) {
    console.log("newMessage Blocked: ", newMessage.isBlocked);
    console.log(receiverUser.blocked);
    newMessage["isDelivered"] = true;
    newMessage["isRead"] = false;
    const emittedMessage = {
      ...newMessage.toObject(),
      username: socket.currUser.username,
      avatar: socket.currUser.avatar,
    };
    io.to(receiverSocketId).emit("new-user-message", {
      newMessage: emittedMessage,
      newMessageCount: 1,
      blockedContact: socket.currUser.blocked,
    });
    newMessage.isDelivered = true;
  }

  io.to(socket.id).emit("message-sent", {
    tempId: message.tempId,
    newId: newMessage._id,
    isDelivered: newMessage.isDelivered,
  });

  await newMessage.save();
};

export const AmIBlocked = async (io, socket, data) => {
  const { myId, userId } = data;
  const UserDetails = await User.findById(userId);

  if (UserDetails.blocked?.includes(myId)) {
    socket.emit("am-i-blocked", true);
  }
};

export const blockedContact = async (io, socket, id) => {
  const receiverSocketId = SocketUsers.get(id);
  if (!socket.currUser?.blocked?.includes(id)) {
    socket.currUser.blocked?.push(id);
    await socket.currUser.save();
  }
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("am-i-blocked", true);
  }
};

export const unblockedContact = async (io, socket, id) => {
  const receiverSocketId = SocketUsers.get(id);
  if (socket.currUser?.blocked?.includes(id)) {
    socket.currUser?.blocked?.pull(id);
    await socket.currUser.save();
  }
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("am-i-blocked", false);
  }
};

export const readMessages = async (io, socket, data) => {
  const receiverId = data.receiverId; // this is me
  const senderId = data.senderId; // this is the other person

  const senderIdDetails = await User.findById(senderId);

  if (senderIdDetails.blocked.includes(receiverId)) {
    return;
  }

  const messagesToUpdate = await UserChat.find(
    { senderId, receiverId, isRead: false, isBlocked: false },
    { _id: 1 }
  );

  if (!messagesToUpdate.length) {
    return;
  }

  const messageIds = messagesToUpdate.map((msg) => msg._id);

  await UserChat.updateMany(
    { _id: { $in: messageIds } },
    { $set: { isRead: true } }
  );

  const senderSocketId = SocketUsers.get(senderId);

  if (senderSocketId) {
    io.to(senderSocketId).emit("messages-read", {
      senderId,
      messageIds,
    });
  }
};

export const deleteMessage = async (io, socket, data) => {
  await UserChat.updateOne({ _id: data.msgId }, { $set: { isDeleted: true } });
  if (SocketUsers.get(data.receiverId)) {
    io.to(SocketUsers.get(data.receiverId)).emit("message-deleted", {
      id: data.msgId,
    });
  }
};

export const userDisconnected = (io, socket) => {
  if (!socket.currUser) {
    console.warn("Socket does not have a current user.");
    return;
  }
  let userId = socket.currUser._id.toString();
  SocketUsers.delete(userId);
  OnlineUsers.delete(userId);  

  socket.currUser.groups.forEach((groupId) => {
    const groupIdStr = groupId.toString();

    if (OnlineGroupUsers.has(groupIdStr)) {
      const groupUsers = OnlineGroupUsers.get(groupIdStr);
      userId = userId.toString();
      if (groupUsers.has(userId)) {
        groupUsers.delete(userId);
        io.emit("online-group-users", {
          groupId: groupIdStr,
          onlineUsers: Array.from(groupUsers),
        });

        io.emit("online-group-users-length", {
          groupId: groupIdStr,
          onlineUsers: Array.from(groupUsers).length,
        });
      }
    }
    socket.leave(groupIdStr);
  });

  socket.disconnect();

  io.emit("online-users", Array.from(OnlineUsers));
};
