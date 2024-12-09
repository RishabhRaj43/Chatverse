import { memberRemoved } from "../SocketControllers/Admin/AdminGroupSocket.controller.js";
import {
  createGroup,
  joinGroup,
  joinRoomGroup,
  leaveGroup,
  leaveRoomGroup,
  readGroupMessage,
  sendGroupMessage,
  sendOnlineGroupUsers,
  sendOnlineGroupUsersLength,
  singleReadGroupMessage,
} from "../SocketControllers/GroupSocket.controller.js";

const GroupSocketEvents = (io, socket) => {
  socket.on("request-group-online-users", (groupIds) =>
    sendOnlineGroupUsers(io, socket, groupIds)
  );
  socket.on("request-online-group-users-length", (groupIds) =>
    sendOnlineGroupUsersLength(io, socket, groupIds)
  );
  socket.on("group-created", (data) => createGroup(io, socket, data));
  socket.on("group-joined", (data) => joinGroup(io, socket, data));
  socket.on("join-group", (data) => joinGroup(io, socket, data));
  socket.on("new-group-message", (data) => sendGroupMessage(io, socket, data));
  socket.on("join-room-group", (data) => joinRoomGroup(io, socket, data));
  socket.on("leave-room-group", (data) => leaveRoomGroup(io, socket, data));
  socket.on("read-group-message", (data) => readGroupMessage(io, socket, data));
  socket.on("single-read-group-message", (data) =>
    singleReadGroupMessage(io, socket, data)
  );
  socket.on("leave-group", (data) => leaveGroup(io, socket, data));

  // Admin actions
  socket.on("remove-member", (data) => memberRemoved(io, socket, data));
};

export default GroupSocketEvents;
