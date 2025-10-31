import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;


const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
