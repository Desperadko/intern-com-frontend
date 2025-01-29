import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    api.post("/auth/register", data),
};

export const opportunities = {
  getAll: () => api.get("/opportunities"),
  getOne: (id: number) => api.get(`/opportunities/${id}`),
  create: (data: any) => api.post("/opportunities", data),
  update: (id: number, data: any) => api.patch(`/opportunities/${id}`, data),
  delete: (id: number) => api.delete(`/opportunities/${id}`),
};

export const emailTemplates = {
  get: (type: "accepted" | "rejected") => api.get(`/email-templates?type=${type}`),
  save: (type: "accepted" | "rejected", template: { subject: string; message: string }) =>
    api.post(`/email-templates?type=${type}`, template),
};

export default api;
