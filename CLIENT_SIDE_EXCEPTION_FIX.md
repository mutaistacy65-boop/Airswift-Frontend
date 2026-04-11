# Client-Side Exception Error - Complete Diagnosis & Fix Guide

## Error Message
```
"a client-side exception has occurred (see the browser console for more information)"
```

## What This Error Means

This generic error occurs when a JavaScript exception happens in the browser that Next.js cannot handle gracefully. Common causes include:

1. **Null/Undefined Reference** - Accessing properties on null/undefined objects
2. **API Response Parsing** - JSON parsing errors or missing properties
3. **Timing Issues** - Race conditions in component initialization  
4. **Hook Misuse** - Using hooks outside of React or in wrong order
5. **Memory Issues** - Very large data structures or memory leaks

---

## Fixes Applied

### 1. ✅ **Dashboard Routing Errors (CRITICAL)**

**Files Fixed:**
- `src/pages/dashboard.tsx`
- `src/pages/admin/index.tsx`

**Issue:** `user.role` was accessed without checking if `user` is null first

**Before:**
```tsx
if (!isAuthenticated) {
  router.push('/login')
} else if (user.role === 'admin') {  // ❌ ERROR: user could be null
  router.push('/admin/dashboard')
}
```

**After:**
```tsx
if (!isAuthenticated || !user) {  // ✅ Check both conditions
  router.push('/login')
} else if (user.role === 'admin') {  // Now safe
  router.push('/admin/dashboard')
}
```

### 2. ✅ **Login Page Null Reference**

**File Fixed:** `src/pages/login.tsx`

**Issue:** Accessing `res.data.user.email` before validating user object exists

**Before:**
```tsx
if (!res.data.user?.isVerified) {
  const email = res.data.user.email  // ❌ ERROR: user might not exist
  router.push(`/verify-otp?email=...`)
}
```

**After:**
```tsx
// Validate first
const { token, user, message } = res.data
if (!token || !user) {
  throw new Error('Login failed: Invalid response')
}

// Then check properties
if (!user.isVerified) {
  const email = user?.email
  if (email) {
    router.push(`/verify-otp?email=...`)
  }
}
```

### 3. ✅ **Error Boundary Component Added**

**File Created:** `src/components/ErrorBoundary.tsx`

This component catches React errors and displays a user-friendly error page instead of crashing.

**Benefits:**
- Shows meaningful error message to users
- Displays error details in development mode
- Provides recovery options (Refresh, Go Home)
- Prevents total app crash

### 4. ✅ **Error Boundary Integrated**

**File Updated:** `src/pages/_app.tsx`

The ErrorBoundary now wraps the entire app to catch any component errors.

---

## How to Debug Your Specific Error

### Step 1: Check Browser Console

1. Open browser DevTools: **F12**
2. Go to **Console** tab
3. Look for red error messages
4. **Copy the full error message**

### Step 2: Open Your Browser Console Right Now

Run this code in your browser console to capture detailed error information:

```javascript
// Copy and paste this into your browser console
window.addEventListener('error', (event) => {
  console.error('=== CLIENT-SIDE ERROR ===');
  console.error('Message:', event.message);
  console.error('File:', event.filename);
  console.error('Line:', event.lineno);
  console.error('Stack:', event.error?.stack);
  console.error('========================');
});

console.log('✅ Error capture enabled. Reproduce the error now.');
```

### Step 3: Reproduce the Error

1. Try to perform the action that causes the error
2. Watch the console for detailed error information
3. **Screenshot or copy the error text**

### Step 4: Common Errors & Solutions

#### Error: "Cannot read property 'role' of undefined"
**Solution:** User object is null. Check authentication status.
```javascript
// In browser console:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
console.log('isAuthenticated:', !!localStorage.getItem('token') && !!localStorage.getItem('user'));
```

#### Error: "Cannot read property 'strengths' of null"
**Solution:** Data object from API is null. Check API response in Network tab.

#### Error: "React Hook 'useAuth' cannot be called"
**Solution:** Hook is being used outside of a component or before provider initialization.

---

## Immediate Actions to Try

### Option 1: Clear Cache & Reload
```
1. Press: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. Clear: Cookies and cached files
3. Reload: The page
4. Try again
```

### Option 2: Hard Refresh
```
Press: Ctrl+F5 (or Cmd+Shift+R on Mac)
```

### Option 3: Incognito/Private Mode
```
1. Open new Incognito Window (Ctrl+Shift+N)
2. Try the same action
3. If it works, it's a cache issue
```

### Option 4: Check Network Tab

1. Open **DevTools** → **Network** tab
2. Reproduce the error
3. Look for **red** requests (4xx or 5xx errors)
4. Click on each request and check the **Response** tab
5. Screenshot any error responses

---

## Testing the Fix

### Run This in Console to Verify Fix:

```javascript
// Test 1: Check Authentication
console.log('=== AUTH CHECK ===');
console.log('Token exists:', !!localStorage.getItem('token'));
console.log('User exists:', !!localStorage.getItem('user'));
try {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('User data:', user);
  console.log('User has role:', !!user.role);
} catch(e) {
  console.error('Invalid user data');
}

// Test 2: Check Navigation
console.log('=== NAVIGATION CHECK ===');
console.log('Current path:', window.location.pathname);

// Test 3: Check Context
console.log('=== CONTEXT CHECK ===');
console.log('AuthProvider loaded:', !!document.querySelector('[data-auth-provider]'));
console.log('NotificationProvider loaded:', !!document.querySelector('[data-notify-provider]'));
```

---

## Deployment/Build Verification

To make sure all fixes are properly deployed:

```bash
# Build the project
npm run build

# Check for errors
echo $?  # Should output 0

# Run tests if available
npm test

# Start dev server
npm run dev
```

---

## Prevention Tips

### 1. Always Check Before Accessing Properties
```tsx
// ❌ BAD
if (isAuthenticated) {
  doSomething(user.role)
}

// ✅ GOOD
if (isAuthenticated && user) {
  doSomething(user.role)
}

// ✅ ALSO GOOD (Optional Chaining)
doSomething(user?.role)
```

### 2. Validate API Responses
```tsx
// ❌ BAD
const { data } = await fetch('/api/data')
setData(data.items) // Could crash if items doesn't exist

// ✅ GOOD
const response = await fetch('/api/data')
const { data } = await response.json()
setData(data?.items || [])
```

### 3. Use TypeScript for Type Safety
```tsx
// ✅ GOOD - TypeScript catches these at compile time
interface User {
  id: string
  role: 'admin' | 'user'
}

const user: User | null = getUser()
if (user?.role === 'admin') {  // Type-safe
  // ...
}
```

---

## Support Resources

### Get Help With Error Details

**Include in your bug report:**
1. Full error message from console
2. Steps to reproduce
3. Browser type and version
4. Network response (from DevTools)
5. Local storage contents (from console)

### Enable Verbose Logging

```javascript
// Add to browser console
localStorage.setItem('DEBUG', 'true');
window.location.reload();

// Then reproduce the error and screenshot console
```

---

## Summary of All Changes

| File | Change | Purpose |
|------|--------|---------|
| `src/pages/dashboard.tsx` | Added null check for user | Prevent null ref errors |
| `src/pages/admin/index.tsx` | Added null check for user | Prevent null ref errors |
| `src/pages/login.tsx` | Better error handling | Safer API response handling |
| `src/components/ErrorBoundary.tsx` | **Created** | Catch React errors gracefully |
| `src/pages/_app.tsx` | Added ErrorBoundary | Prevent total app crash |
| `ERROR_DEBUGGER.js` | **Created** | Debug tools for console |

---

**Status:** ✅ All critical null reference issues have been fixed. The ErrorBoundary will catch any remaining runtime errors.

If you still see errors after these fixes, please:
1. Run the debugger script above
2. Capture the exact error message
3. Check the Network tab for API failures
4. Share the error details with the development team
