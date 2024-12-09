import GroupChat from "../../../Models/Chat/Group/GroupChat.model.js";
import Group from "../../../Models/Group/Group.model.js";
import User from "../../../Models/User/User.model.js";
import { OnlineGroupUsers } from "../GroupSocket.controller.js";
import { OnlineUsers, SocketUsers } from "../UserSocket.controller.js";

export const memberRemoved = async (io, socket, data) => {
  try {
    const { groupId, memberId, memberName } = data;

    OnlineGroupUsers.get(groupId).delete(memberId);

    const targetSocket = io.sockets.sockets.get(
      SocketUsers.get(memberId.toString())
    );

    if (targetSocket) {
      targetSocket.leave(groupId);
      targetSocket.leave(`${groupId}-group`);
    }

    const notificationMessage = new GroupChat({
      groupId,
      isNotification: true,
      message: `${socket.currUser.username} has removed ${memberName} from the group.`,
      senderId: socket.currUser._id,
      messageType: "text",
      deliveredTo: Array.from(OnlineGroupUsers.get(groupId) || []),
      readBy: [socket.currUser._id],
    });

    await Promise.all([
      await Group.updateOne({ _id: groupId }, { $pull: { members: memberId } }),
      await Group.updateOne({ _id: groupId }, { $pull: { Admins: memberId } }),
      await User.updateOne({ _id: memberId }, { $pull: { groups: groupId } }),
      await notificationMessage.save(),
    ]);

    io.to(`${groupId}`).emit("member-removed", {
      groupId,
      memberId,
      memberName,
      adminName: socket.currUser.username,
    });
    io.to(SocketUsers.get(memberId)).emit("you-are-removed", {
      groupId,
      adminName: socket.currUser.username,
    });
    io.to(`${groupId}-group`).emit("member-removed", {
      groupId,
      memberId,
      memberName,
      adminName: socket.currUser.username,
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

    io.to(`${groupId}-group`).emit("new-group-message", {
      message: {
        ...notificationMessage._doc,
        _id: notificationMessage._id,
        deliveredTo: Array.from(OnlineGroupUsers.get(groupId)),
        readBy: [socket.currUser._id],
      },
    });

    io.emit("online-group-users-length", {
      groupId,
      onlineUsers: Array.from(OnlineGroupUsers.get(groupId) || []).length,
    });
  } catch (error) {
    console.log("Error in memberRemoved: ", error);
    socket.emit("member-removed-error", { message: error.message });
  }
};
