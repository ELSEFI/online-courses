import api from "./axios";

export const messagesApi = {
  getAll: () => api.get("/admin/users/messages").then(r=>r.data),
  getById: id => api.get(`/admin/users/messages/${id}`).then(r=>r.data),
  reply: (id,payload) => api.post(`/admin/users/messages/${id}/reply-message`, payload).then(r=>r.data),
  delete: id => api.delete(`/admin/users/messages/${id}/delete-message`).then(r=>r.data),
  deleteAll: () => api.delete(`/admin/users/messages/delete-messages`).then(r=>r.data),
};
