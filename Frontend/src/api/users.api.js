import api from "./axios";

export const usersApi = {
  getAll: () => api.get("/admin/users").then(r=>r.data),
  getById: id => api.get(`/admin/users/${id}`).then(r=>r.data),
  add: payload => api.post("/admin/users/add-user", payload).then(r=>r.data),
  delete: id => api.delete(`/admin/users/${id}`).then(r=>r.data),
  toggleStatus: id => api.patch(`/admin/users/${id}/update-status`).then(r=>r.data),
};
