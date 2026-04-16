import axios, { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airswift-backend-fjt3.onrender.com';

export const API_URL =
  BACKEND_BASE_URL.replace(/\/+$/, '') +
  (BACKEND_BASE_URL.endsWith('/api') ? '' : '/api');

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window === 'undefined') {
      return config;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

    if (token) {
      config.headers = new AxiosHeaders({
        ...config.headers,
        Authorization: `Bearer ${token}`,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
export { API };