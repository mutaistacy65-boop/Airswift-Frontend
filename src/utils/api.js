const API_URL = process.env.NEXT_PUBLIC_API_URL;
import axios from 'axios';

export const apiFetch = async (url, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

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
        const refreshResult = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
          withCredentials: true,
        });

        const data = refreshResult.data;

        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          return apiFetch(url, options);
        }
      } catch (refreshError) {
        throw refreshError;
      }
    }
    throw error;
  }
};
