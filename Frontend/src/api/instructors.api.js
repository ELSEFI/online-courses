import api from "./axios";

export const instructorsApi = {
  getAll: () => api.get("/admin/instructors").then(r=>r.data),
  getById: id => api.get(`/admin/instructors/${id}`).then(r=>r.data),
  add: formData => api.post(`/admin/instructors/add-instructor`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then(r=>r.data),
  remove: id => api.delete(`/admin/instructors/${id}/remove-instructor`).then(r=>r.data),
};
