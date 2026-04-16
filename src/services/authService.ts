// Base API URL
import API from '@/services/apiClient'
import { reconnectSocket } from '@/services/socket'

const AuthService = {
  // Registration with email verification
  register: async (name: string, email: string, password: string, role?: string) => {
    try {
      const result = await API.post('/api/auth/register', {
        name,
        email,
        password,
        role: role || 'user'
      })

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
      const result = await API.post('/api/auth/login', {
        email,
        password
      });

      const data = result.data;

      // 🔍 DEBUG: Log the exact response structure
      console.log('🔍 LOGIN RESPONSE DEBUG:');
      console.log('Full response:', result);
      console.log('Response.data:', data);
      console.log('Response.data structure:', JSON.stringify(data, null, 2));

      // Check all possible token locations
      let token = null;
      let tokenSource = '';

      if (data.token) {
        token = data.token;
        tokenSource = 'data.token';
      } else if (data.accessToken) {
        token = data.accessToken;
        tokenSource = 'data.accessToken';
      } else if (data.data?.token) {
        token = data.data.token;
        tokenSource = 'data.data.token';
      } else if (data.data?.accessToken) {
        token = data.data.accessToken;
        tokenSource = 'data.data.accessToken';
      }

      console.log('🔍 TOKEN EXTRACTION:');
      console.log('  Token found:', token ? 'YES' : 'NO');
      console.log('  Token source:', tokenSource);
      console.log('  Token value:', token ? `${token.substring(0, 20)}...` : 'undefined');

      // Store tokens and user data
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('accessToken', token);
        console.log('✅ Token saved to localStorage');
        console.log('   Verify with: localStorage.getItem("token")');
      } else {
        console.error('❌ NO TOKEN FOUND IN RESPONSE!');
        console.error('   Possible locations checked:');
        console.error('   - data.token');
        console.error('   - data.accessToken');
        console.error('   - data.data.token');
        console.error('   - data.data.accessToken');
      }

      // Store user data (check multiple locations)
      let user = null;
      if (data.user) {
        user = data.user;
      } else if (data.data?.user) {
        user = data.data.user;
      }

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        console.log('✅ User data saved to localStorage');
      }

      // Reconnect socket with new token
      console.log('🔌 Reconnecting socket with new token...');
      reconnectSocket();

      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Get Profile (Protected)
  getProfile: async () => {
    try {
      const result = await API.get('/auth/profile');
      return result.data.user;
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      throw new Error(error.response?.data?.message || 'Unauthorized');
    }
  },

  // Logout
  logout: async () => {
    try {
      await API.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
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
      const result = await API.get(`/auth/verify?token=${token}`);

      const data = result.data;

      // Store tokens from verification
      if (data.token || data.accessToken) {
        const token = data.token || data.accessToken;
        localStorage.setItem('token', token);
        localStorage.setItem('accessToken', token);
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
      const result = await API.post('/api/auth/resend-verification', {
        email
      });

      return result.data;
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(error.response?.data?.message || 'Failed to resend verification email');
    }
  }
};

export default AuthService;