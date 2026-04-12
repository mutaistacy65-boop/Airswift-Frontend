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

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airswift-backend-fjt3.onrender.com';

export const API_URL =
  BACKEND_BASE_URL.replace(/\/+$/, '') +
  (BACKEND_BASE_URL.endsWith('/api') ? '' : '/api');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // 🍪 CRITICAL for cookie-based auth
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} with token: ${token.substring(0, 20)}...`);
  } else {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} (no token)`);
  }

  return config;
});

export default api;