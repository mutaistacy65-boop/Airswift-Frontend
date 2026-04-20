# ✅ Authentication System Upgrade Guide

## Overview

The authentication system has been upgraded with the following improvements:

### New Features

1. **AuthService Class** - Centralized authentication management
2. **Response Normalization** - Handles multiple backend response formats
3. **Token Management** - Robust token storage and retrieval
4. **Error Handling** - Comprehensive error handling with recovery
5. **Troubleshooting Tools** - Built-in debugging utilities
6. **Environment Checking** - Validation of configuration variables

---

## 🔧 AuthService Usage

### Importing AuthService

```typescript
import AuthService from '@/services/AuthService';
```

### Authentication Methods

#### Login
```typescript
const result = await AuthService.login(email, password);
if (result.success) {
  console.log('User:', result.user);
  console.log('Token:', result.token);
} else {
  console.error('Login failed:', result.error);
}
```

#### Register
```typescript
const result = await AuthService.register(name, email, password, role);
if (result.success) {
  console.log('Registration successful');
  console.log('User:', result.user);
}
```

#### Logout
```typescript
AuthService.logout();
// Clears tokens, user data, and disconnects socket
```

#### Refresh Token
```typescript
const result = await AuthService.refreshToken();
if (result.success) {
  console.log('New token:', result.token);
}
```

### Token Management

```typescript
// Get current token
const token = AuthService.getToken();

// Get stored user
const user = AuthService.getUser();

// Check if authenticated
const isAuth = AuthService.isAuthenticated();

// Check if admin
const isAdmin = AuthService.isAdmin();

// Get auth header for manual API calls
const headers = AuthService.getAuthHeader();
```

### Profile Operations

```typescript
// Get profile
const result = await AuthService.getProfile();
if (result.success) {
  console.log('Profile:', result.user);
}

// Update profile
const result = await AuthService.updateProfile({
  name: 'New Name',
  phone: '+1234567890',
});

// Change password
const result = await AuthService.changePassword(
  currentPassword,
  newPassword
);
```

### Password Reset

```typescript
// Request reset
const result = await AuthService.requestPasswordReset(email);

// Reset with token
const result = await AuthService.resetPassword(resetToken, newPassword);
```

---

## 🧪 Troubleshooting Tools

### Running Diagnostics

Open your browser console after login and run:

```javascript
AuthTroubleshoot.testCompleteFlow();
```

This will check:
- ✅ Token storage
- ✅ Token validity (JWT format)
- ✅ API requests
- ✅ Socket connection
- ✅ API interceptors

### Individual Checks

```javascript
// Check token storage
AuthTroubleshoot.checkTokenStorage();

// Test API request
await AuthTroubleshoot.testAPIRequest();

// Check socket connection
await AuthTroubleshoot.checkSocketConnection();

// Check interceptor config
AuthTroubleshoot.checkAPIInterceptor();
```

---

## 🔒 Response Normalization

The system automatically handles multiple response formats from the backend:

```javascript
// Handles all these formats:

// Format 1: Direct structure
{ token: "...", user: {...} }

// Format 2: Nested structure
{ data: { token: "...", user: {...} } }

// Format 3: User as response
{ ...user, token: "..." }

// The system normalizes to:
// const token = data.token || data.data?.token || data.data?.accessToken
// const user = data.user || data.data?.user || data
```

---

## 🔐 AuthContext Integration

The AuthContext has been upgraded to use AuthService:

```typescript
import { useAuth } from '@/context/AuthContext';

export function MyComponent() {
  const { user, login, logout, refreshUser } = useAuth();

  const handleLogin = async (email, password) => {
    const result = await AuthService.login(email, password);
    if (result.success) {
      await login(result);
      // User is now authenticated
    }
  };

  return (
    <>
      {user && <p>Welcome {user.name}</p>}
      <button onClick={() => logout()}>Logout</button>
    </>
  );
}
```

---

## 🚀 Real-time Socket Integration

AuthService automatically manages socket connections:

```typescript
// Socket is initialized on login
await AuthService.login(email, password);
// Socket is now connected with auth token

// Socket disconnects on logout
AuthService.logout();

// Reconnect socket manually
const socket = require('@/services/socket').reconnectSocket();
```

---

## 📊 Environment Configuration

### Check Environment Variables

```bash
npm run check-env
```

### Required Variables for Production

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `JWT_SECRET` - Token signing secret
- `JWT_EXPIRY` - Token expiration time
- `REFRESH_TOKEN_EXPIRY` - Refresh token expiration

### Optional Variables

- `SENTRY_DSN` - Error tracking
- `ANALYTICS_ID` - Analytics tracking

---

## 🐛 Error Handling

All AuthService methods return consistent response objects:

```typescript
interface AuthResponse {
  success: boolean;
  error?: string;      // Error message if failed
  message?: string;    // Success message
  token?: string;      // Auth token if applicable
  user?: User;         // User object if applicable
}
```

Handle errors properly:

```typescript
const result = await AuthService.login(email, password);

if (!result.success) {
  // Handle specific errors
  if (result.error?.includes('invalid')) {
    console.log('Invalid credentials');
  } else if (result.error?.includes('verify')) {
    console.log('Please verify your email');
  } else {
    console.log('Login failed:', result.error);
  }
}
```

---

## 📝 Migration Guide

### From Old Implementation

**Before:**
```typescript
const res = await loginUser({ email, password });
const { token, user } = res;  // Might fail with inconsistent responses
```

**After:**
```typescript
const result = await AuthService.login(email, password);
if (result.success) {
  const { token, user } = result;  // Always works, consistent format
}
```

---

## 🔗 Useful Resources

- [JWT Token Structure](https://jwt.io/)
- [Socket.IO Events](https://socket.io/docs/v4/emit-cheatsheet/)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)

---

## ✅ Next Steps

1. ✅ Update pages to use AuthService.login() instead of loginUser()
2. ✅ Replace API calls with AuthService methods
3. ✅ Run AuthTroubleshoot.testCompleteFlow() to verify setup
4. ✅ Test password reset flow
5. ✅ Verify socket connections in real-time components

---

## 📞 Support

For debugging:
1. Check browser console for error messages
2. Run `AuthTroubleshoot.testCompleteFlow()` to identify issues
3. Check token validity: `AuthTroubleshoot.checkTokenStorage()`
4. Verify API requests: `await AuthTroubleshoot.testAPIRequest()`

