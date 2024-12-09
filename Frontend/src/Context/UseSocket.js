import { io } from "socket.io-client";
import { create } from "zustand";

const useSocket = create((set) => ({
  socket: null,
  connectSocket(token) {
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
      auth: { token },
    });
    set({ socket });
  },
}));

export default useSocket;
