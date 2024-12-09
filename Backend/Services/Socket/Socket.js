import { Server } from "socket.io";
import UserSocketEvents from "../SocketEvents/UserSocket.events.js";
import GroupSocketEvents from "../SocketEvents/GroupSocket.events.js";
import {
  userDisconnected,
  userRefreshed,
} from "../SocketControllers/UserSocket.controller.js";
import jwt from "jsonwebtoken";
import User from "../../Models/User/User.model.js";

const SocketInit = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userid;
      const currUser = await User.findById(decoded.userid);
      socket.currUser = currUser;
      next();
    } catch (error) {
      console.log("error", error);

      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    if (!socket.currUser) {
      return socket.disconnect();
    }
    const userId = socket.userId;

    if (userId) userRefreshed(io, socket, userId);

    UserSocketEvents(io, socket);

    GroupSocketEvents(io, socket);

    socket.on("disconnect", () => {
      userDisconnected(io, socket);
    });
  });
};

export default SocketInit;
