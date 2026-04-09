import axios from "axios";

/**
 * 🍪 CRITICAL: withCredentials: true
 * 
 * This is REQUIRED for cookie-based authentication.
 * Without it, browsers will NOT send cookies with requests.
 * 
 * Configuration:
 * - withCredentials: true → sends cookies with requests
 * - Backend must set sameSite: "none" for cross-origin cookies
 * - Backend must set secure: true for HTTPS
 * - Backend must set httpOnly: true for XSS protection
 */

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,  // 🍪 CRITICAL for cookie-based auth
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      if (token && config.headers) {
        const headers = config.headers as any;

        if (typeof headers.set === "function") {
          headers.set("Authorization", `Bearer ${token}`);
        } else {
          headers.Authorization = `Bearer ${token}`;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
