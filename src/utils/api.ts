import axios from "axios";

/**
 * 🍪 CRITICAL: withCredentials: true
 *
 * This is REQUIRED for cookie-based authentication.
 * Without it, browsers will NOT send cookies with requests.
 *
 * withCredentials enables:
 * 1. Sending cookies with requests (Authorization)
 * 2. Receiving Set-Cookie headers (Authentication)
 * 3. Cross-origin cookie sharing (requires sameSite: "none" on backend)
 *
 * Frontend sends credentials ✅
 * Backend MUST set sameSite: "none" ✅
 * Backend MUST set secure: true (on HTTPS) ✅
 */

export const api = axios.create({
  baseURL: "https://airswift-backend-fjt3.onrender.com/api",
  withCredentials: true,  // 🍪 CRITICAL for cookie-based auth
});

// Request interceptor
api.interceptors.request.use(
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

export default api;