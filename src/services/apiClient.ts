import axios, { InternalAxiosRequestConfig } from 'axios';

export const API_URL = 'https://airswift-backend-fjt3.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

// CRITICAL: Attach token to EVERY request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (token) {
    // ✅ CORRECT METHOD: Use direct assignment
    config.headers.Authorization = `Bearer ${token}`;
    
    // Debug logging (remove in production)
    console.log('✅ Token attached:', `${token.substring(0, 20)}...`);
  } else {
    console.warn('⚠️ No token found in localStorage');
  }
  
  return config;
});

// Usage examples (note: no /api prefix here)
// await api.get('/profile');
// await api.post('/applications', formData); // do NOT set Content-Type manually

export default api;