import axios, { InternalAxiosRequestConfig } from 'axios';

export const API_URL = 'https://airswift-backend-fjt3.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: false, // true only if using cookie-based auth
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

// Usage examples (note: no /api prefix here)
// await api.get('/profile');
// await api.post('/applications', formData); // do NOT set Content-Type manually

export default api;