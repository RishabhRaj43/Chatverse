import api from "../../Api";

const authApi = {
  userInfo: () => api.get("/api/user/auth/user-info"),
  signup: (formData) => api.post("/api/user/auth/signup", formData),
  login: (formData) => api.post("/api/user/auth/login", formData),
  logout: () => api.get("/api/user/auth/logout"),
  update: (formData) => api.put("/api/user/auth/update-user", formData),
  uploadAvatar: (avatarUrl) =>
    api.post("/api/user/auth/upload-avatar", avatarUrl),
};

export default authApi;
