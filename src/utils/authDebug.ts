import axios from 'axios';
import { api } from '@/services/apiClient';

/**
 * HARD FIX: Manual token verification and forced request
 * Use this to debug authentication issues
 */

export const debugToken = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  console.log('🔍 TOKEN DEBUG:');
  console.log('  localStorage.getItem("token"):', localStorage.getItem('token'));
  console.log('  localStorage.getItem("accessToken"):', localStorage.getItem('accessToken'));
  console.log('  Using token:', token ? `${token.substring(0, 20)}...` : 'NULL');
  return token;
};

/**
 * HARD FIX: Force attach token manually (bypass interceptor)
 * Use this if interceptor is broken
 */
export const forcePostWithToken = async (url: string, data: any, token?: string) => {
  const authToken = token || debugToken();

  if (!authToken) {
    throw new Error('❌ No token found! Please login first.');
  }

  console.log('🚨 FORCE ATTACH TOKEN DEBUG:');
  console.log('  URL:', url);
  console.log('  Token being used:', `${authToken.substring(0, 20)}...`);
  console.log('  Data type:', data instanceof FormData ? 'FormData' : typeof data);

  try {
    const response = await axios.post(
      `https://airswift-backend-fjt3.onrender.com/api${url}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          // Let axios handle Content-Type for FormData
          ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        },
      }
    );

    console.log('✅ FORCE REQUEST SUCCESS:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ FORCE REQUEST FAILED:', error.response?.data || error.message);
    console.error('  Status:', error.response?.status);
    throw error;
  }
};

/**
 * Test the current API instance (with interceptor)
 */
export const testApiInstance = async (url: string = '/profile') => {
  console.log('🧪 TESTING API INSTANCE:');
  console.log('  URL:', url);

  try {
    const response = await api.get(url);
    console.log('✅ API INSTANCE WORKS:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API INSTANCE FAILED:', error.response?.data || error.message);
    console.error('  Status:', error.response?.status);
    throw error;
  }
};

/**
 * Complete debug suite
 */
export const runFullDebug = async () => {
  console.log('🔧 RUNNING FULL AUTH DEBUG...\n');

  // 1. Check token
  const token = debugToken();
  console.log('');

  // 2. Test API instance
  try {
    await testApiInstance('/profile');
  } catch (error) {
    console.log('❌ API instance failed, trying force method...\n');

    // 3. Try force method
    try {
      await forcePostWithToken('/auth/profile', {}, token);
    } catch (error) {
      console.log('❌ Both methods failed - likely backend issue\n');
    }
  }
};

// Test login response structure
export const testLoginStructure = async (email: string, password: string) => {
  console.log('🔍 TESTING LOGIN RESPONSE STRUCTURE...');
  console.log('  Email:', email);
  console.log('  Password:', password ? '***provided***' : 'missing');

  try {
    const response = await axios.post(
      'https://airswift-backend-fjt3.onrender.com/api/auth/login',
      { email, password }
    );

    console.log('✅ Login request successful');
    console.log('🔍 RESPONSE ANALYSIS:');
    console.log('  Status:', response.status);
    console.log('  Full response.data:', response.data);

    // Analyze structure
    const data = response.data;
    console.log('  Response structure:');
    console.log('    data.token:', data.token ? 'EXISTS' : 'MISSING');
    console.log('    data.accessToken:', data.accessToken ? 'EXISTS' : 'MISSING');
    console.log('    data.data:', data.data ? 'EXISTS' : 'MISSING');

    if (data.data) {
      console.log('    data.data.token:', data.data.token ? 'EXISTS' : 'MISSING');
      console.log('    data.data.accessToken:', data.data.accessToken ? 'EXISTS' : 'MISSING');
      console.log('    data.data.user:', data.data.user ? 'EXISTS' : 'MISSING');
    }

    console.log('    data.user:', data.user ? 'EXISTS' : 'MISSING');

    // Extract token using same logic as authService
    let token = null;
    let tokenPath = '';

    if (data.token) {
      token = data.token;
      tokenPath = 'data.token';
    } else if (data.accessToken) {
      token = data.accessToken;
      tokenPath = 'data.accessToken';
    } else if (data.data?.token) {
      token = data.data.token;
      tokenPath = 'data.data.token';
    } else if (data.data?.accessToken) {
      token = data.data.accessToken;
      tokenPath = 'data.data.accessToken';
    }

    console.log('🎯 TOKEN EXTRACTION RESULT:');
    console.log('  Path used:', tokenPath || 'NONE FOUND');
    console.log('  Token value:', token ? `${token.substring(0, 20)}...` : 'null');

    if (!token) {
      console.error('❌ CRITICAL: No token found in response!');
      console.error('   This means login will save undefined token');
      console.error('   Check backend response structure');
    } else {
      console.log('✅ Token found - login should work');
    }

    return { response: data, token, tokenPath };
  } catch (error: any) {
    console.error('❌ Login test failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Quick token path checker
 */
export const checkTokenPaths = (responseData: any) => {
  const paths = [
    'token',
    'accessToken',
    'data.token',
    'data.accessToken',
    'data.data.token',
    'data.data.accessToken'
  ];

  console.log('🔍 CHECKING TOKEN PATHS:');
  paths.forEach(path => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], responseData);
    console.log(`  ${path}: ${value ? 'EXISTS' : 'MISSING'}`);
    if (value) {
      console.log(`    Value: ${typeof value === 'string' ? `${value.substring(0, 20)}...` : value}`);
    }
  });
};

// Make available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).debugToken = debugToken;
  (window as any).forcePostWithToken = forcePostWithToken;
  (window as any).testApiInstance = testApiInstance;
  (window as any).runFullDebug = runFullDebug;
  (window as any).testLoginStructure = testLoginStructure;
  (window as any).checkTokenPaths = checkTokenPaths;
}
