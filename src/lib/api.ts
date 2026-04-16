// 🔥 CENTRAL API CLIENT - FIXES ALL 401 ERRORS
// This is the ONLY axios instance you should use

import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: 'https://airswift-backend-fjt3.onrender.com/api',
  withCredentials: true,
});

// 🔥 Attach token to EVERY request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('🔥 INTERCEPTOR - REQUEST:', config.url);
  console.log('   Sending token:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('   ✅ Authorization header set');
  } else {
    console.warn('   ❌ NO TOKEN FOUND - Request may fail with 401');
  }
  return config;
});

// 🔥 Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ RESPONSE:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError | any) => {
    console.error('❌ API ERROR:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
    });

    // Handle 401 - session expired
    if (error.response?.status === 401) {
      console.error('🔐 UNAUTHORIZED - Clearing token and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('role');

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

