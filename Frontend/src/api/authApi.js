import api from "./axios";

export const authApi = {
  profile: () => api.get("/users/me").then((res) => res.data),
};
