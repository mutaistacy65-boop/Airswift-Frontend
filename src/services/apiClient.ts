// ✅ FIXED: API Configuration with Axios Interceptors
// This file provides automatic Authorization header handling

import axios, { AxiosError } from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'https://airswift-backend-fjt3.onrender.com/api',
  withCredentials: true, // Include cookies for authentication
});

export const API_URL = api.defaults.baseURL;

// ✅ REQUEST INTERCEPTOR: Add Authorization header with Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

  console.log('📤 API REQUEST INTERCEPTOR:');
  console.log('   URL:', config.url);
  console.log('   Method:', config.method?.toUpperCase());
  console.log('   Token in localStorage:', token ? '✓ EXISTS' : '✗ MISSING');

  // ✅ FIX: Add Authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('   ✅ Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.warn('   ⚠️ No token found - request may fail with 401');
  }

  return config;
});

// ✅ RESPONSE INTERCEPTOR: Handle authentication errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API RESPONSE:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError | any) => {
    console.error('❌ API ERROR:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });

    // Handle different error types
    if (error.response?.status === 401) {
      console.warn('🔐 UNAUTHORIZED - Token invalid or expired');
      console.warn('   Clearing stored tokens and redirecting to login');
      
      // Clear all authentication tokens
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      
      // Show user message and redirect
      if (typeof window !== 'undefined') {
        alert("Session expired. Please login again.");
        window.location.href = '/login';
      }
    } else if (!error.response) {
      console.error('🌐 NETWORK ERROR - No response from server');
      console.error('   Server may be down or unreachable');
    }

    return Promise.reject(error);
  }
);

export default api;