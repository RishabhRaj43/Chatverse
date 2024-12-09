import { create } from "zustand";
import authApi from "../API/User/Auth/AuthApi";
import useSocket from "./UseSocket";

const useProfile = create((set) => {
  const user = localStorage.getItem("token_user") || null;
  const avatar = localStorage.getItem("avatar_url") || null;

  return {
    user: user,
    avatar: avatar,
    login(token) {
      localStorage.setItem("token_user", token);
      set({ user: token });
      const { connectSocket } = useSocket.getState();
      connectSocket(token);
    },
    async logout(socket) {
      await authApi.logout();
      localStorage.removeItem("token_user");
      localStorage.removeItem("avatar_url");

      if (socket) {
        socket.disconnect();
      }
      set({ user: null });
    },
    setAvatar(avatarUrl) {
      localStorage.setItem("avatar_url", avatarUrl); // Store avatar URL in localStorage
      set({ avatar: avatarUrl });
    },
  };
});

export default useProfile;
