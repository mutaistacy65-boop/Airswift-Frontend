/**
 * Application Form Submission Test
 * 
 * This file helps test the application form submission flow
 * Run in browser console to test various scenarios
 */

const ApplicationFormTester = {
  // Test 1: Check if files are properly attached to FormData
  testFormDataCreation: async () => {
    console.log('=== Test 1: FormData Creation ===');
    const formData = new FormData();
    
    // Create mock file
    const mockPassport = new File(['test'], 'passport.pdf', { type: 'application/pdf' });
    const mockCV = new File(['test'], 'cv.pdf', { type: 'application/pdf' });
    
    formData.append('jobId', 'test-job-id');
    formData.append('nationalId', '12345678');
    formData.append('phone', '+254712345678');
    formData.append('passport', mockPassport);
    formData.append('cv', mockCV);
    
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
    }
    return formData;
  },

  // Test 2: Check authentication token
  testAuthentication: () => {
    console.log('=== Test 2: Authentication ===');
    const accessToken = localStorage.getItem('accessToken');
    const token = localStorage.getItem('token');
    
    console.log('Access Token exists:', !!accessToken);
    console.log('Token exists:', !!token);
    
    if (accessToken) {
      console.log('Access Token (first 50 chars):', accessToken.substring(0, 50) + '...');
    }
    if (token) {
      console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    }
    
    return accessToken || token;
  },

  // Test 3: Test API endpoint connectivity
  testAPIConnectivity: async () => {
    console.log('=== Test 3: API Connectivity ===');
    try {
      const response = await fetch('/api/applications', {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
      });
      console.log('API endpoint responsive:', response.ok || response.status === 405);
      console.log('Status:', response.status);
    } catch (error) {
      console.error('API connectivity error:', error.message);
    }
  },

  // Test 4: Log form submission details
  testSubmissionDetails: async () => {
    console.log('=== Test 4: Submission Details ===');
    const formState = {
      jobId: sessionStorage.getItem('test_jobId') || 'N/A',
      nationalId: sessionStorage.getItem('test_nationalId') || 'N/A',
      phone: sessionStorage.getItem('test_phone') || 'N/A',
      hasPassport: sessionStorage.getItem('test_hasPassport') === 'true',
      hasCv: sessionStorage.getItem('test_hasCv') === 'true',
    };
    console.log('Current form state:', formState);
    return formState;
  },

  // Test 5: Test actual submission with mock data
  testMockSubmission: async () => {
    console.log('=== Test 5: Mock Submission ===');
    const formData = new FormData();
    
    // Create more realistic mock files
    const mockPassport = new File(
      [new Uint8Array(100)], // 100 bytes of binary data
      'mock_passport.pdf',
      { type: 'application/pdf' }
    );
    const mockCV = new File(
      [new Uint8Array(100)],
      'mock_cv.pdf',
      { type: 'application/pdf' }
    );
    
    formData.append('jobId', 'test-job-' + Date.now());
    formData.append('nationalId', '12345678');
    formData.append('phone', '+254712345678');
    formData.append('passport', mockPassport);
    formData.append('cv', mockCV);
    
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found!');
        return;
      }
      
      console.log('Sending mock submission...');
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('Non-JSON response:', text);
        data = { rawText: text };
      }
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      
      if (!response.ok) {
        console.error('Submission failed:', data.message);
      } else {
        console.log('Submission successful!');
      }
    } catch (error) {
      console.error('Submission error:', error.message);
      console.error('Full error:', error);
    }
  },

  // Test 6: Check browser support
  testBrowserSupport: () => {
    console.log('=== Test 6: Browser Support ===');
    console.log('FormData supported:', typeof FormData !== 'undefined');
    console.log('Fetch API supported:', typeof fetch !== 'undefined');
    console.log('FileList supported:', typeof FileList !== 'undefined');
    console.log('localStorage supported:', typeof localStorage !== 'undefined');
    console.log('User Agent:', navigator.userAgent);
  },

  // Run all tests
  runAll: async function() {
    console.clear();
    console.log('🧪 RUNNING APPLICATION FORM SUBMISSION TESTS');
    console.log('==========================================\n');
    
    this.testBrowserSupport();
    console.log();
    
    this.testAuthentication();
    console.log();
    
    await this.testAPIConnectivity();
    console.log();
    
    this.testFormDataCreation();
    console.log();
    
    this.testSubmissionDetails();
    console.log();
    
    console.log('✅ Basic tests completed!');
    console.log('⚠️  For mock submission test, run: ApplicationFormTester.testMockSubmission()');
  }
};

// Auto-run on load
console.log('Application Form Tester loaded!');
console.log('Run: ApplicationFormTester.runAll() to test all features');
console.log('OR run individual tests like: ApplicationFormTester.testAuthentication()');

// Export for use
window.ApplicationFormTester = ApplicationFormTester;
