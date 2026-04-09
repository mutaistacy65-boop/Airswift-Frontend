import axios from 'axios'

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

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,  // 🍪 CRITICAL for cookie-based auth
})

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (token && config.headers) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return config;
})

export default API
