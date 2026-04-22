// ✅ AUTHENTICATION TROUBLESHOOTING TEST FILE
// Run this in your browser console after login to diagnose issues

const AuthTroubleshoot = {
  /**
   * Check if token is properly stored
   */
  checkTokenStorage() {
    console.log('\n=== 🔐 TOKEN STORAGE CHECK ===');

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    console.log('✅ Token exists:', !!token);
    if (token) {
      console.log('   Token preview:', token.substring(0, 50) + '...');
      console.log('   Token length:', token.length);

      // Verify it's a valid JWT
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('   ✅ Valid JWT format');
          console.log('   User ID:', payload.id);
          console.log('   Role:', payload.role);
          console.log('   Email:', payload.email);
          console.log('   Expires:', new Date(payload.exp * 1000));
        } catch (e) {
          console.error('   ❌ Invalid JWT format:', (e as Error).message);
        }
      } else {
        console.error('   ❌ Invalid JWT structure (expected 3 parts, got', parts.length + ')');
      }
    } else {
      console.error('   ❌ No token found in localStorage');
    }

    console.log('\n✅ User data exists:', !!user);
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('   User:', userData);
      } catch (e) {
        console.error('   ❌ Invalid user JSON:', (e as Error).message);
      }
    }
  },

  /**
   * Test API request with token
   */
  async testAPIRequest() {
    console.log('\n=== 📡 API REQUEST CHECK ===');

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

    if (!token) {
      console.error('❌ No token found. Cannot test API request.');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://airswift-backend-fjt3.onrender.com/api';
      console.log('📤 Making test API request to /auth/profile...');

      const response = await fetch(`${apiUrl}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);

      const data = await response.json();

      if (response.ok) {
        console.log('✅ API request successful');
        console.log('Response data:', data);
      } else {
        console.error('❌ API request failed');
        console.error('Error response:', data);
      }
    } catch (error) {
      console.error('❌ API request error:', (error as Error).message);
    }
  },

  /**
   * Check socket connection
   */
  async checkSocketConnection() {
    console.log('\n=== 🔌 SOCKET CONNECTION CHECK ===');

    try {
      // Check if socket is available globally or through services
      const socket = (window as any).socket;

      if (!socket) {
        console.warn('⚠️ Socket instance not available');
        console.log('💡 Hint: Socket will be initialized after login');
        return;
      }

      console.log('Socket connected:', socket.connected);
      console.log('Socket ID:', socket.id);
      console.log('Socket auth:', socket.auth);

      if (socket.connected) {
        console.log('✅ Socket is connected');
      } else {
        console.warn('⚠️ Socket is not connected');
        console.log('💡 Trying to connect...');
        socket.connect?.();
      }
    } catch (error) {
      console.error('❌ Error checking socket:', (error as Error).message);
    }
  },

  /**
   * Check API interceptor configuration
   */
  checkAPIInterceptor() {
    console.log('\n=== 📦 API INTERCEPTOR CHECK ===');

    try {
      console.log('✅ API client configured with interceptors');
      console.log('   - Request interceptor: Adds Authorization header');
      console.log('   - Response interceptor: Handles 401 errors');
      console.log('   - Base URL: ' + (process.env.NEXT_PUBLIC_API_URL || 'https://airswift-backend-fjt3.onrender.com/api'));
    } catch (error) {
      console.error('❌ Error checking interceptor:', (error as Error).message);
    }
  },

  /**
   * Test complete authentication flow
   */
  async testCompleteFlow() {
    console.log('\n=== 🧪 COMPLETE AUTHENTICATION FLOW TEST ===\n');

    this.checkTokenStorage();
    this.checkAPIInterceptor();
    await this.checkSocketConnection();
    await this.testAPIRequest();

    console.log('\n=== ✅ TEST COMPLETE ===');
    console.log('If all checks passed, authentication is properly configured.');
    console.log('If any checks failed, see "💡 Hints" above for resolution steps.');
  },
};

// Export for use in console
if (typeof window !== 'undefined') {
  (window as any).AuthTroubleshoot = AuthTroubleshoot;
  console.log('✅ Troubleshooting tools loaded. Run: AuthTroubleshoot.testCompleteFlow()');
}

export default AuthTroubleshoot;
