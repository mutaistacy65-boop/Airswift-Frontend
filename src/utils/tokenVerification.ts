/**
 * 🔧 TOKEN ATTACHMENT VERIFICATION
 * Run this immediately after login to diagnose token issues
 */

export const quickTokenCheck = () => {
  console.log('\n🔧 QUICK TOKEN CHECK\n');

  // 1. Check localStorage
  const token = localStorage.getItem('token');
  console.log('1️⃣  localStorage.getItem("token"):');
  console.log(`   ${token ? '✅ EXISTS' : '❌ MISSING'}`);

  if (!token) {
    console.error('   ❌ CRITICAL: No token in localStorage!');
    console.error('   Solution: Login first');
    return false;
  }

  console.log(`   Token: ${token.substring(0, 30)}...`);

  // 2. Check token format
  const parts = token.split('.');
  console.log('\n2️⃣  Token format:');
  console.log(`   Parts: ${parts.length} (Should be 3)`);
  if (parts.length === 3) {
    console.log('   ✅ Valid JWT format');
  } else {
    console.log('   ❌ Invalid format');
  }

  // 3. Check token expiration
  try {
    const payload = JSON.parse(atob(parts[1]));
    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();
    console.log('\n3️⃣  Token expiration:');
    console.log(`   Expires: ${expiresAt.toLocaleString()}`);
    console.log(`   Now: ${now.toLocaleString()}`);
    if (now < expiresAt) {
      console.log('   ✅ Token is NOT expired');
    } else {
      console.error('   ❌ Token is EXPIRED!');
      return false;
    }
  } catch (e) {
    console.error('   ⚠️  Could not decode token:', e);
  }

  console.log('\n✅ Token looks valid\n');
  return true;
};

/**
 * Test what headers are being sent
 */
export const testRequestHeaders = async () => {
  console.log('\n🧪 TESTING REQUEST HEADERS\n');

  try {
    // Import API client to use the authenticated API
    const { default: API } = await import('@/lib/api');
    
    // This endpoint should echo back the headers it receives
    const response = await API.get(
      '/debug/headers'
    );

    const data = response.data;
    console.log('📤 Headers sent by browser:');
    console.log(JSON.stringify(data, null, 2));

    if (data.Authorization) {
      console.log('✅ Authorization header was sent');
    } else {
      console.error('❌ Authorization header was NOT sent');
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};

/**
 * Comprehensive token diagnostic
 */
export const diagnoseTokenIssue = async () => {
  console.log('\n════════════════════════════════════════');
  console.log('    TOKEN ATTACHMENT DIAGNOSTIC');
  console.log('════════════════════════════════════════\n');

  // Step 1: Token in storage
  const tokenValid = quickTokenCheck();

  if (!tokenValid) {
    console.error('\n❌ Cannot proceed - no valid token\n');
    return;
  }

  // Step 2: Test headers
  console.log('Step 2: Testing request headers...\n');
  await testRequestHeaders();

  console.log('\n════════════════════════════════════════');
  console.log('    NEXT: Try making an API request');
  console.log('    Check console for interceptor logs');
  console.log('════════════════════════════════════════\n');
};

// Make globally available
if (typeof window !== 'undefined') {
  (window as any).quickTokenCheck = quickTokenCheck;
  (window as any).testRequestHeaders = testRequestHeaders;
  (window as any).diagnoseTokenIssue = diagnoseTokenIssue;
}
