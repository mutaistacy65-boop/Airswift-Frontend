# 🚀 Authorization Header Implementation - Quick Guide

## Two Methods for Sending Authorization Header

### Method 1: Axios Interceptor (AUTOMATIC) ✅
**Used by all axios-based requests automatically**

```typescript
// In API client config
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Usage - no need to set header manually!
const response = await api.post('/endpoint', data);  // ✅ Token added automatically
```

### Method 2: Manual Header (FOR FETCH) ✅
**Only needed when using fetch() API**

```typescript
// Usage with fetch()
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  },
  body: data
});
```

---

## Implementation Status

### ✅ Files Using Axios Interceptor (Automatic)
```
src/services/jobService.ts
src/services/profileService.ts
src/components/VoiceInterview.tsx
src/pages/admin/send-message.tsx
```

All these files use `API.post()` or `API.get()` which automatically includes the Authorization header via the interceptor.

### ✅ Files Using Fetch with Manual Headers
```
src/components/ApplicationForm.tsx
src/components/SafeApplicationForm.tsx
```

These manually set: `Authorization: Bearer ${token}`

---

## Key Files

### 1. Axios Configuration with Interceptor
**File**: `src/utils/api.ts`
**What it does**: 
- Creates axios instance
- Adds interceptor that sets Authorization header on ALL requests
- Result: Every API call includes `Authorization: Bearer <token>`

### 2. API Client Export
**File**: `src/services/apiClient.ts`
**What it does**: Exports the configured axios instance to all services

### 3. Services Using API Client
- jobService.ts → Uses API.post() → Gets token via interceptor ✅
- profileService.ts → Uses API.post() → Gets token via interceptor ✅

---

## Important: FormData + Authorization

### ✅ CORRECT WAY
```typescript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('data', value);

// Using axios - Authorization set by interceptor
const response = await API.post('/endpoint', formData);
// Headers automatically set to:
// Authorization: Bearer <token>
// Content-Type: multipart/form-data; boundary=---xxx

// OR using fetch - Set authorization manually
const response = await fetch('/endpoint', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
    // DO NOT set Content-Type!
  },
  body: formData
});
```

### ❌ WRONG WAY
```typescript
// Setting Content-Type manually (breaks multipart/form-data)
API.post('/endpoint', formData, {
  headers: { 'Content-Type': 'application/json' } // ❌ WRONG!
});

// Setting Authorization manually when using axios (redundant)
API.post('/endpoint', formData, {
  headers: { Authorization: `Bearer ${token}` } // ❌ Redundant - interceptor already does this
});
```

---

## Testing the Implementation

### 1. Check Chrome DevTools -> Network Tab
- Open browser console
- Go to Network tab
- Make an API request
- Click on request
- Look at Headers section
- **Should see**: `Authorization: Bearer eyJhbGc...`

### 2. Check Console Logs
The interceptor logs every request:
```
API Request: POST /api/endpoint with token: eyJhbGc...
```

### 3. Test File Upload
- Submit a form with a file
- Check Network tab - verify:
  - ✅ Authorization header present
  - ✅ Content-Type has boundary (multipart/form-data; boundary=...)
  - ✅ Files uploaded successfully

---

## Token Storage

The system looks for token in this order:
1. `localStorage.getItem("token")`
2. `localStorage.getItem("accessToken")`

**Result**: Either key works, system is flexible and compatible

---

## Zero Changes Needed For:

These components/services already work correctly:

- ✅ `src/pages/jobs/apply/[id].tsx` - Uses jobService
- ✅ `src/components/VoiceInterview.tsx` - Uses API.post()
- ✅ `src/pages/admin/send-message.tsx` - Uses API.post()

Just submit and Authorization header is included automatically!

---

## Summary

| Feature | Status | How |
|---------|--------|-----|
| Authorization Header | ✅ Implemented | Axios Interceptor (auto) + Fetch manual |
| FormData Handling | ✅ Fixed | Smart Content-Type (auto for FormData) |
| Backend URL | ✅ Correct | `https://airswift-backend-fjt3.onrender.com/api` |
| Token Keys | ✅ Flexible | Checks both `token` and `accessToken` |
| Error Handling | ✅ Ready | 401 triggers token refresh |

**Everything is ready to use!** 🎉
