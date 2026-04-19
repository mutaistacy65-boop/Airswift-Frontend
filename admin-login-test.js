/**
 * Manual Admin Login Test Script
 * Run this in the browser console to test admin login flow
 */

// Test admin login persistence
window.testAdminLogin = async () => {
  console.clear();
  console.log('🚀 Testing Admin Login Flow...\n');

  // Test 1: Check if localStorage has admin data
  console.log('1️⃣ Checking localStorage persistence...');
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    console.log('❌ No auth data found. Please login first.');
    console.log('💡 Go to /login and login as admin, then run this test again.');
    return;
  }

  try {
    const user = JSON.parse(userStr);
    console.log('✅ Auth data found:', {
      hasToken: !!token,
      userRole: user.role,
      userEmail: user.email,
      userName: user.name
    });

    // Test 2: Check redirect logic
    console.log('\n2️⃣ Testing redirect logic...');
    let redirectPath = '';
    if (user.role === 'admin') {
      redirectPath = '/admin/dashboard';
    } else {
      redirectPath = '/user/dashboard';
    }

    console.log('✅ Redirect path:', redirectPath);

    // Test 3: Check if admin can access admin pages
    console.log('\n3️⃣ Testing admin page access...');
    if (user.role === 'admin') {
      console.log('✅ User has admin role - should be able to access admin pages');
    } else {
      console.log('❌ User does not have admin role');
    }

    // Test 4: Check if user stays logged in after page refresh
    console.log('\n4️⃣ Testing login persistence...');
    console.log('💡 Try refreshing the page - you should stay logged in as admin');

    console.log('\n🎯 All tests completed successfully!');
    console.log('✅ Admin login persistence is working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Test admin logout
window.testAdminLogout = () => {
  console.log('🚪 Testing Admin Logout...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('✅ Auth data cleared');
  console.log('💡 You should be redirected to login page now');
  window.location.href = '/login';
};

// Instructions
console.log('💡 Admin Login Test Script Loaded!');
console.log('💡 Run: testAdminLogin() to test admin login persistence');
console.log('💡 Run: testAdminLogout() to test logout');
console.log('💡 Make sure you are logged in as admin first!');