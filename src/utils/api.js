import axios from 'axios';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airswift-backend-fjt3.onrender.com';

export const API_URL =
  BACKEND_BASE_URL.replace(/\/+$/, '') +
  (BACKEND_BASE_URL.endsWith('/api') ? '' : '/api');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

export const apiFetch = async (url, options = {}) => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('accessToken') || localStorage.getItem('token')
      : null;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    withCredentials: true,
  };

  try {
    const result = await axios(`${API_URL}${url}`, config);
    return result.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        const refreshResult = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        const data = refreshResult.data;

        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('token', data.accessToken);
          return apiFetch(url, options);
        }
      } catch (refreshError) {
        throw refreshError;
      }
    }
    throw error;
  }
};
