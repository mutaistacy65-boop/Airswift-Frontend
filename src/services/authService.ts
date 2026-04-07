// Base API URL
import { apiFetch, storeAuthTokens, clearAuthTokens } from '@/utils/apiFetch'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const AuthService = {
  // Registration with email verification
  register: async (name: string, email: string, password: string, role?: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role: role || 'user' }),
      });

      const result = await res.json();

      console.log('REGISTER RESPONSE:', result);

      if (!res.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store both tokens and user data
      if (data.accessToken && data.refreshToken) {
        storeAuthTokens(data.accessToken, data.refreshToken)
      }
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get Profile (Protected)
  getProfile: async () => {
    try {
      const response = await apiFetch('/api/auth/profile', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        // Token expired or invalid
        clearAuthTokens();
        throw new Error(data.message || 'Unauthorized');
      }

      return data.user;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
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
      const response = await fetch(`${API_BASE_URL}/api/auth/verify?token=${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }

      // Store both tokens from verification
      if (data.accessToken && data.refreshToken) {
        storeAuthTokens(data.accessToken, data.refreshToken)
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },

  // Resend verification email
  resendVerificationEmail: async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      return data;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }
};

export default AuthService;