/**
 * 🔧 AXIOS INTERCEPTOR DEBUGGER
 * Use this to verify token attachment to requests
 */

import API from '@/lib/api';

/**
 * Test if token is being attached to requests
 */
export const testTokenAttachment = async () => {
  console.log('🧪 TESTING TOKEN ATTACHMENT...\n');

  // Step 1: Check localStorage
  const token = localStorage.getItem('token');
  console.log('📍 Step 1: Check localStorage');
  console.log(`   localStorage.getItem("token"): ${token ? 'EXISTS' : 'MISSING'}`);
  if (token) {
    console.log(`   Token preview: ${token.substring(0, 20)}...`);
  } else {
    console.error('   ❌ NO TOKEN IN LOCALSTORAGE! Login first!');
    return;
  }

  // Step 2: Test API instance with interceptor
  console.log('\n📍 Step 2: Test API instance (WITH interceptor)');
  try {
    const response = await API.get('/debug/headers');
    const receivedAuth = response.data?.Authorization;
    
    if (receivedAuth) {
      console.log('   ✅ Token WAS attached to request');
      console.log(`   Backend received: ${receivedAuth.substring(0, 30)}...`);
    } else {
      console.error('   ❌ Token NOT attached');
    }
    return true;
  } catch (error: any) {
    console.error('   ❌ Request failed:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.error('   💡 401 = Either no token or invalid token sent');
    }
    return false;
  }
};

/**
 * Test WITHOUT interceptor (direct API client)
 */
export const testDirectAxios = async () => {
  console.log('\n🧪 TESTING DIRECT API CLIENT (WITH interceptor)...\n');

  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ No token in localStorage');
    return;
  }

  try {
    const response = await API.get(
      '/debug/headers'
    );

    console.log('✅ API client request succeeded');
    console.log('   Backend received:', response.data?.Authorization?.substring(0, 30));
    return true;
  } catch (error: any) {
    console.error('❌ API client request failed:', error.response?.status);
    return false;
  }
};

/**
 * Compare interceptor vs direct
 */
export const compareTokenAttachment = async () => {
  console.log('🔄 COMPARING INTERCEPTOR vs DIRECT\n');

  const withInterceptor = await testTokenAttachment();
  const withoutInterceptor = await testDirectAxios();

  console.log('\n📊 RESULTS:');
  console.log(`   With interceptor: ${withInterceptor ? '✅ WORKS' : '❌ BROKEN'}`);
  console.log(`   Direct request:   ${withoutInterceptor ? '✅ WORKS' : '❌ BROKEN'}`);

  if (!withInterceptor && withoutInterceptor) {
    console.error('\n🚨 CRITICAL: Interceptor is NOT attaching token!');
    console.error('   Fix: Check apiClient.ts interceptor implementation');
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testTokenAttachment = testTokenAttachment;
  (window as any).testDirectAxios = testDirectAxios;
  (window as any).compareTokenAttachment = compareTokenAttachment;
}
