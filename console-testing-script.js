/**
 * Browser Console Testing Script
 * 
 * Copy and paste these commands into your browser console (DevTools) 
 * to quickly test authentication flows.
 * 
 * Usage: Open DevTools (F12), go to Console tab, and paste commands
 */

// ==========================================
// SETUP FUNCTIONS
// ==========================================

// Generate unique test email
function generateTestEmail() {
  return `test+${Date.now()}@example.com`;
}

// Get API base URL from environment
function getApiUrl() {
  return window.location.origin; // Frontend URL
}

// Log styled message
function log(title, data) {
  console.log(`%c${title}`, 'color: #0066cc; font-weight: bold; font-size: 14px;', data);
}

// ==========================================
// REGISTRATION TESTS
// ==========================================

/**
 * Test 1: Register a new user
 * Usage: registerNewUser()
 */
async function registerNewUser() {
  const email = generateTestEmail();
  const userData = {
    name: 'Test User',
    email: email,
    password: 'TestPassword123!',
  };

  log('📝 STARTING REGISTRATION:', userData);

  try {
    const response = await fetch(`${getApiUrl()}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    log('✅ REGISTER RESPONSE:', data);

    // Store email in localStorage for OTP verification
    localStorage.setItem('pendingEmail', email);
    localStorage.setItem('pendingName', userData.name);
    localStorage.setItem('pendingPassword', userData.password);

    console.log(`📧 Email stored: ${email}`);
    console.log('⏭️  Next: Go to http://localhost:3000/verify-otp');
    return data;
  } catch (error) {
    log('❌ REGISTRATION ERROR:', error.message);
    throw error;
  }
}

/**
 * Test 2: Get OTP from console logs
 * Usage: console logs will show OTP during registration
 * The OTP is printed to browser console in development
 */
function showOtpInstructions() {
  console.log('%c📌 OTP Instructions:', 'color: #ff9900; font-weight: bold; font-size: 14px;');
  console.log('1. Look in the console above for: "Registration OTP for [email]: [OTP]"');
  console.log('2. Copy the OTP code (6 digits)');
  console.log('3. Go to: http://localhost:3000/verify-otp');
  console.log('4. Paste the OTP and verify');
  console.log('5. Account will be created!');
}

// ==========================================
// LOGIN TESTS
// ==========================================

/**
 * Test 3: Login with credentials
 * Usage: loginUser('testuser@example.com', 'TestPassword123!')
 */
async function loginUser(email, password) {
  log('🔐 STARTING LOGIN:', { email });

  try {
    const response = await fetch(`${getApiUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    log('✅ LOGIN RESPONSE:', data);

    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      console.log('✨ Login successful! Token stored in localStorage');
      console.log(`🎯 Redirecting to: ${data.user?.role === 'admin' ? '/admin/dashboard' : '/job-seeker/dashboard'}`);
    } else {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  } catch (error) {
    log('❌ LOGIN ERROR:', error.message);
    throw error;
  }
}

/**
 * Test 4: Login with wrong password
 * Usage: loginWithWrongPassword('testuser@example.com')
 */
async function loginWithWrongPassword(email) {
  log('🔐 TESTING WRONG PASSWORD:', { email });
  return loginUser(email, 'WrongPassword123!');
}

// ==========================================
// SESSION TESTS
// ==========================================

/**
 * Test 5: Check if user is logged in
 * Usage: checkLoginStatus()
 */
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  console.log('%c🔍 LOGIN STATUS:', 'color: #00cc00; font-weight: bold; font-size: 14px;');
  console.log('Token exists:', !!token);
  console.log('User data exists:', !!user);

  if (token) {
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
  }

  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User data:', userData);
    } catch (e) {
      console.log('User data (raw):', user);
    }
  }

  return { logged_in: !!token, token_exists: !!token, user_data: user ? JSON.parse(user) : null };
}

/**
 * Test 6: Logout
 * Usage: logout()
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  console.log('%c✅ Logged out:', 'color: #ff6666; font-weight: bold;');
  console.log('Auth data cleared from localStorage');
}

/**
 * Test 7: Clear all auth data
 * Usage: clearAllAuthData()
 */
function clearAllAuthData() {
  localStorage.clear();
  sessionStorage.clear();
  console.log('%c🗑️  All data cleared:', 'color: #ff6666; font-weight: bold;');
}

// ==========================================
// DEBUGGING FUNCTIONS
// ==========================================

/**
 * Test 8: Test direct API connectivity
 * Usage: testApiConnectivity()
 */
async function testApiConnectivity() {
  console.log('%c🔌 TESTING API CONNECTIVITY:', 'color: #0066cc; font-weight: bold; font-size: 14px;');

  try {
    // Try to reach a test endpoint
    const response = await fetch(`${getApiUrl()}/api/health`, {
      timeout: 5000,
    }).catch(() => {
      throw new Error('API not responding');
    });

    if (response) {
      log('✅ API IS ACCESSIBLE', { status: response.status });
    }
  } catch (error) {
    log('❌ API NOT ACCESSIBLE:', error.message);
  }
}

/**
 * Test 9: Display all stored auth data
 * Usage: displayAuthData()
 */
function displayAuthData() {
  console.log('%c📦 STORED AUTH DATA:', 'color: #0066cc; font-weight: bold; font-size: 14px;');
  console.table({
    token: localStorage.getItem('token')?.substring(0, 20) + '...' || 'NOT SET',
    user: localStorage.getItem('user') ? 'SET' : 'NOT SET',
    pendingEmail: localStorage.getItem('pendingEmail') || 'NOT SET',
  });
}

/**
 * Test 10: Manual API test
 * Usage: manualApiTest('POST', '/api/auth/login', { email: 'test@example.com', password: 'pass' })
 */
async function manualApiTest(method, endpoint, data) {
  log(`🔧 MANUAL API TEST: ${method} ${endpoint}`, data);

  try {
    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await response.json();
    log(`✅ RESPONSE (${response.status}):`, responseData);
    return responseData;
  } catch (error) {
    log('❌ REQUEST ERROR:', error.message);
    throw error;
  }
}

// ==========================================
// QUICK TEST SCENARIOS
// ==========================================

/**
 * Test 11: Run complete registration flow (up to OTP)
 * Usage: runRegistrationFlow()
 */
async function runRegistrationFlow() {
  console.log('%c🚀 RUNNING COMPLETE REGISTRATION FLOW', 'background: #0066cc; color: white; padding: 10px; font-size: 14px;');

  try {
    // Step 1: Register
    console.log('\n📍 Step 1: Registering user...');
    const registerResult = await registerNewUser();

    console.log('\n📍 Step 2: Check for OTP');
    showOtpInstructions();

    console.log('\n📍 Step 3: Navigate to /verify-otp and enter the OTP');

    return registerResult;
  } catch (error) {
    console.error('❌ Flow failed:', error);
  }
}

/**
 * Test 12: Run login test
 * Usage: runLoginFlow('testuser@example.com', 'TestPassword123!')
 */
async function runLoginFlow(email, password) {
  console.log('%c🚀 RUNNING LOGIN FLOW', 'background: #0066cc; color: white; padding: 10px; font-size: 14px;');

  try {
    const result = await loginUser(email, password);
    checkLoginStatus();
    return result;
  } catch (error) {
    console.error('❌ Login failed:', error);
  }
}

// ==========================================
// HELP & COMMANDS
// ==========================================

/**
 * Display all available commands
 * Usage: help()
 */
function help() {
  console.log('%c📚 AVAILABLE COMMANDS', 'background: #0066cc; color: white; padding: 10px; font-size: 14px; font-weight: bold;');

  const commands = {
    'REGISTRATION': {
      'registerNewUser()': 'Register a new user with auto-generated email',
      'showOtpInstructions()': 'Show OTP verification instructions',
    },
    'LOGIN': {
      'loginUser(email, password)': 'Login with email and password',
      'loginWithWrongPassword(email)': 'Test login error with wrong password',
    },
    'SESSION': {
      'checkLoginStatus()': 'Check if user is logged in',
      'logout()': 'Clear session data',
      'clearAllAuthData()': 'Clear all stored data',
    },
    'DEBUGGING': {
      'testApiConnectivity()': 'Test if API is reachable',
      'displayAuthData()': 'Show all stored auth data',
      'manualApiTest(method, endpoint, data)': 'Make manual API request',
    },
    'FLOWS': {
      'runRegistrationFlow()': 'Run complete registration (until OTP)',
      'runLoginFlow(email, password)': 'Run login flow',
    },
    'HELP': {
      'help()': 'Display this help message',
    },
  };

  for (const [category, cmds] of Object.entries(commands)) {
    console.group(`%c${category}`, 'font-weight: bold; color: #0066cc;');
    for (const [cmd, desc] of Object.entries(cmds)) {
      console.log(`  %c${cmd}%c - ${desc}`, 'color: #ff9900; font-weight: bold;', 'color: #333;');
    }
    console.groupEnd();
  }

  console.log('\n💡 Example usage:');
  console.log('  1. registerNewUser()');
  console.log('  2. loginUser("testuser@example.com", "TestPassword123!")');
  console.log('  3. checkLoginStatus()');
  console.log('  4. logout()');
}

// ==========================================
// AUTO-DISPLAY HELP ON LOAD
// ==========================================

console.log('%c' + '='.repeat(50), 'color: #0066cc;');
console.log('%c✨ Authentication Testing Console Ready!', 'color: #0066cc; font-weight: bold; font-size: 16px;');
console.log('%c' + '='.repeat(50), 'color: #0066cc;');
console.log('\n💬 Type: help() - to see all available commands\n');

// Make functions globally available
window.registerNewUser = registerNewUser;
window.loginUser = loginUser;
window.loginWithWrongPassword = loginWithWrongPassword;
window.checkLoginStatus = checkLoginStatus;
window.logout = logout;
window.clearAllAuthData = clearAllAuthData;
window.testApiConnectivity = testApiConnectivity;
window.displayAuthData = displayAuthData;
window.manualApiTest = manualApiTest;
window.runRegistrationFlow = runRegistrationFlow;
window.runLoginFlow = runLoginFlow;
window.showOtpInstructions = showOtpInstructions;
window.help = help;
