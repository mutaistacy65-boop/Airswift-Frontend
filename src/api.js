import axios from "axios";

const api = axios.create({
  baseURL: "https://airswift-backend-fjt3.onrender.com/api",
});

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("SENDING TOKEN:", token); // 👈 debug

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;