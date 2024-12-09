import api from "../../Api";

const userChatApi = {
  getChat: (id) => api.get(`/api/user/chat-user/get-chat/${id}`),
  getChats: () => api.get("/api/user/chat-user/get-all-chats"),
  sendChat: (message) =>
    api.post(`/api/user/chat-user/send-chat/${message.receiverId}`, message),
  deleteChat: (id) => api.delete(`/api/user/chat-user/delete-chat/${id}`),
};

export default userChatApi;
