import api from "../../Api";

const groupChatApi = {
  // User actions

  getChats: () => api.get("/api/user/group/get-all-group-chats"),
  getChat: (handle) => api.get(`/api/user/group/get-group-chat/${handle}`),
  createChat: (formData) =>
    api.post("/api/user/group/create-group-chat", formData),
  leaveChat: (chatId) => api.get(`/api/user/group/leave-group/${chatId}`),
  joinGroup: (handle) => api.get(`/api/user/group/join-group/${handle}`),
  getGroupInfo: (handle) => api.get(`/api/user/group/get-group-info/${handle}`),
  getGroupJoinInfo: (handle) =>
    api.get(`/api/user/group/get-group-join-info/${handle}`),

  // Admin actions

  deleteChat: (chatId) => api.delete(`/api/user/group/delete-group/${chatId}`),
};

export default groupChatApi;
