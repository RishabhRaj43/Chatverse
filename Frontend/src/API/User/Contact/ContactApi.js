import api from "../../Api";

const contactApi = {
  save: (formData) => api.post("/api/user/contacts/save-contact", formData),
  get: () => api.get("/api/user/contacts/get-contacts"),
  delete: (id) =>
    api.delete(`/api/user/contacts/delete-contact/${id}`,),
  getOne: (id) => api.post(`/api/user/contacts/contact-info`, { id }),
  searchContact: (formData) =>
    api.post(`/api/user/contacts/search-contact`, formData),
  blockContact : (id)=> api.put(`/api/user/contacts/block-contact/${id}`),
  unblockContact : (id)=> api.put(`/api/user/contacts/unblock-contact/${id}`),
};

export default contactApi;
