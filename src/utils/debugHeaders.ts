import API from '@/services/apiClient';

/**
 * Debug utility to verify Authorization headers are being sent correctly
 * Usage: await debugHeaders();
 */
export async function debugHeaders() {
  try {
    const response = await API.get('/debug/headers');
    console.log('✅ Headers received by backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to verify headers:', error);
    throw error;
  }
}

/**
 * Development-only: Check header before sending request
 * Usage: await API.get('/profile', { transformRequest: [logHeaders] });
 */
export const logHeaders = (data: any, headers: any) => {
  console.log('📋 Auth header:', headers?.Authorization);
  console.log('📋 Token from localStorage:', localStorage.getItem('token'));
  return data;
};

/**
 * Manual header verification without backend endpoint
 */
export function verifyLocalHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = token ? `Bearer ${token}` : 'NO TOKEN';
  console.log('✅ Local Authorization header:', authHeader);
  return { Authorization: authHeader };
}
