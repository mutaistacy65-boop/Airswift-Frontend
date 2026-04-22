/**
 * Client-Side Exception Debugger
 * 
 * Run this in the browser console to capture and display detailed error information
 * Copy and paste all of this into your browser console when you see the error
 */

// Step 1: Capture all errors with full details
window.addEventListener('error', (event) => {
  console.error('=== ERROR CAPTURED ===');
  console.error('Message:', event.message);
  console.error('Filename:', event.filename);
  console.error('Line Number:', event.lineno);
  console.error('Column Number:', event.colno);
  console.error('Full Stack:', event.error?.stack);
  console.error('==================');
  
  // Log to localStorage for persistence
  const errors = JSON.parse(localStorage.getItem('debug_errors') || '[]');
  errors.push({
    timestamp: new Date().toISOString(),
    message: event.message,
    filename: event.filename,
    line: event.lineno,
    column: event.colno,
    stack: event.error?.stack,
  });
  localStorage.setItem('debug_errors', JSON.stringify(errors.slice(-10))); // Keep last 10
});

// Step 2: Capture unhandledrejection events
window.addEventListener('unhandledrejection', (event) => {
  console.error('=== UNHANDLED PROMISE REJECTION ===');
  console.error('Reason:', event.reason);
  console.error('Promise:', event.promise);
  console.error('Stack:', event.reason?.stack);
  console.error('====================================');
});

// Step 3: Wrap fetch to capture network errors
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  const options = args[1] || {};
  
  console.log(`[FETCH] ${options.method || 'GET'} ${url}`);
  
  return originalFetch.apply(this, args)
    .then(response => {
      if (!response.ok) {
        console.warn(`[FETCH ERROR] ${response.status} ${response.statusText} for ${url}`);
      }
      return response;
    })
    .catch(error => {
      console.error(`[FETCH FAILED] ${error.message} for ${url}`);
      throw error;
    });
};

// Step 4: Helper to view captured errors
window.viewCapturedErrors = () => {
  const errors = JSON.parse(localStorage.getItem('debug_errors') || '[]');
  console.table(errors);
};

// Step 5: Helper to clear errors
window.clearCapturedErrors = () => {
  localStorage.removeItem('debug_errors');
  console.log('Captured errors cleared');
};

// Step 6: System diagnostics
window.runDiagnostics = () => {
  console.log('%c=== SYSTEM DIAGNOSTICS ===', 'color: blue; font-weight: bold;');
  
  // Check authentication
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  console.log('Auth Token:', token ? 'Present (' + token.length + ' chars)' : 'Missing');
  console.log('User Data:', user ? JSON.parse(user) : 'Missing');
  
  // Check browser features
  console.log('Browser Features:');
  console.log('  - localStorage:', typeof localStorage !== 'undefined');
  console.log('  - fetch:', typeof fetch !== 'undefined');
  console.log('  - WebSocket:', typeof WebSocket !== 'undefined');
  
  // Check Next.js
  console.log('Next.js Router:', window.location.pathname);
  
  console.log('%c=== END DIAGNOSTICS ===', 'color: blue; font-weight: bold;');
};

console.log(
  '%c✅ DEBUG TOOLS LOADED',
  'color: green; font-size: 14px; font-weight: bold;'
);
console.log('Available commands:');
console.log('  - window.viewCapturedErrors() - See all captured error details');
console.log('  - window.clearCapturedErrors() - Clear error log');
console.log('  - window.runDiagnostics() - Run system diagnostics');
console.log('  - window.fetch() calls are automatically logged');
