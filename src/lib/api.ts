// 🔥 CENTRAL API CLIENT - FIXES ALL 401 ERRORS
// This is the ONLY axios instance you should use

import axios, { AxiosError } from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api',
  withCredentials: true,
});

// 🔥 Attach token to EVERY request
API.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// 🔥 Handle responses and errors
API.interceptors.response.use(
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

export default API;
export { API };

