import {
  deleteMessage,
  readMessages,
  unblockedContact,
  blockedContact,
  requestOnlineUsers,
  sendMessage,
  AmIBlocked,
} from "../SocketControllers/UserSocket.controller.js";

const UserSocketEvents = (io, socket) => {
  socket.on("send-user-message", (message) => sendMessage(io, socket, message));
  socket.on("delete-message", (id) => deleteMessage(io, socket, id));

  socket.on("am-i-blocked", (data) => AmIBlocked(io, socket, data));

  socket.on("unblock-contact", (id) => unblockedContact(io, socket, id));
  socket.on("block-contact", (id) => blockedContact(io, socket, id));

  socket.on("request-online-users", () => requestOnlineUsers(io, socket));

  socket.on("read-messages", (data) => {
    readMessages(io, socket, data);
  });
};

export default UserSocketEvents;
