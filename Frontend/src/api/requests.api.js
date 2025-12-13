import api from "./axios";

export const requestsApi = {
  getAll: () => api.get("/admin/users/requests").then(r=>r.data),
  getById: id => api.get(`/admin/users/requests/${id}`).then(r=>r.data),
  approve: id => api.patch(`/admin/users/requests/${id}/approve-request`).then(r=>r.data),
  reject: (id,payload) => api.patch(`/admin/users/requests/${id}/reject-request`, payload).then(r=>r.data),
};
