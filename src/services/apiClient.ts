import axios from "axios";

// 🔥 GLOBAL API INSTANCE
const API = axios.create({
  baseURL: "https://airswift-backend-fjt3.onrender.com/api",
  withCredentials: true,
});

// 🔐 Add auth automatically
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default API;
