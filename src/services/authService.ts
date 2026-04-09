// Base API URL
import { apiFetch, storeAuthTokens, clearAuthTokens } from '@/utils/apiFetch'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const AuthService = {
  // Registration with email verification
  register: async (name: string, email: string, password: string, role?: string) => {
    try {
      const result = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
        role: role || 'user'
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('REGISTER RESPONSE:', result.data);

      return result.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Login
  login: async (email: string, password: string) => {
    try {
      const result = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data = result.data;

      // Store both tokens and user data
      if (data.accessToken && data.refreshToken) {
        storeAuthTokens(data.accessToken, data.refreshToken)
      }
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Get Profile (Protected)
  getProfile: async () => {
    try {
      const data = await apiFetch('/api/auth/profile', {
        method: 'GET',
      });

      return data.user;
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      throw new Error(error.response?.data?.message || 'Unauthorized');
    }
  },

  // Logout
  logout: async () => {
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local storage
    clearAuthTokens();
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Get access token
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  // Get refresh token
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  // Verify email with token
  verifyEmail: async (token: string) => {
    try {
      const result = await axios.get(`${API_BASE_URL}/api/auth/verify?token=${token}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data = result.data;

      // Store both tokens from verification
      if (data.accessToken && data.refreshToken) {
        storeAuthTokens(data.accessToken, data.refreshToken)
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  },

  // Resend verification email
  resendVerificationEmail: async (email: string) => {
    try {
      const result = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, {
        email
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      return result.data;
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(error.response?.data?.message || 'Failed to resend verification email');
    }
  }
};

export default AuthService;