# ✅ API & Authentication Best Practices

## 1️⃣ Token Storage (After Login)

**✅ DONE in `src/services/authService.ts`**

```typescript
const token = response.data.token || response.data.accessToken;
localStorage.setItem('token', token);
localStorage.setItem('accessToken', token);
```

Token is automatically saved after successful login.

---

## 2️⃣ Centralized Axios Instance

**✅ DONE in `src/services/apiClient.ts`**

```typescript
import axios, { InternalAxiosRequestConfig } from 'axios';

export const API_URL = 'https://airswift-backend-fjt3.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: false, // true only if using cookie-based auth
});

// Automatically attach token to ALL requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

export default api;
```

**Benefits:**
- ✅ Token attached automatically to every request
- ✅ Single source of truth for API configuration
- ✅ No need to manually set `Authorization` header anywhere

---

## 3️⃣ Use the API Instance Everywhere

**✅ DONE**

```typescript
// ✅ CORRECT - Uses centralized instance with automatic token
import { api } from '@/services/apiClient';

await api.get('/profile');
await api.post('/applications', data);
await api.put('/users/1', data);
await api.delete('/drafts');
```

**❌ WRONG - Direct axios calls (bypass interceptor)**
```typescript
import axios from 'axios';
await axios.get('/profile'); // ❌ No token attached!
```

---

## 4️⃣ File Upload (FormData) - CRITICAL!

**✅ DONE in:**
- `src/components/ApplicationForm.tsx`
- `src/pages/job-seeker/profile.tsx`
- `src/components/VoiceInterview.tsx`

```typescript
const formData = new FormData();
formData.append('cv', file);
formData.append('passport', passportFile);

// ✅ CORRECT - Let axios handle everything
const response = await api.post('/applications', formData);

// ❌ DO NOT DO THIS:
// - DO NOT set Content-Type header manually
// - DO NOT set Authorization header manually (interceptor does it)
// ❌ WRONG:
const response = await api.post('/applications', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',      // ❌ REMOVE
    'Authorization': `Bearer ${token}`,          // ❌ REMOVE
  },
});
```

**Why?**
- Axios automatically detects FormData and sets the correct `Content-Type: multipart/form-data`
- Setting it manually can break the boundary delimiter that axios generates
- The interceptor handles `Authorization` automatically
- Result: 401 errors on file uploads are usually caused by explicitly setting these headers

---

## 5️⃣ Socket.IO Authentication

**✅ DONE in `src/services/socket.ts`**

```typescript
import { io } from 'socket.io-client';

const socket = io('https://airswift-backend-fjt3.onrender.com', {
  auth: {
    token: localStorage.getItem('token') || localStorage.getItem('accessToken'),
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
});
```

**Socket connection flow:**
1. Browser: Sends token in `auth` object during handshake
2. Server: Validates token and accepts/rejects connection
3. Browser: Automatically reconnects with token if disconnected

---

## 6️⃣ Quick Header Verification

**Use the debug page:** `/debug-headers`

Or programmatically:
```typescript
import { debugHeaders, verifyLocalHeaders } from '@/utils/debugHeaders';

// Check locally (no backend call)
verifyLocalHeaders(); // Shows: Authorization: Bearer <token>

// Check what backend receives
const headers = await debugHeaders(); // Calls /debug/headers endpoint
```

---

## 7️⃣ Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **401 Unauthorized on file upload** | Manual Content-Type or Authorization breaks axios FormData handling | Remove manual headers, use api.post() directly |
| **Token not sent in requests** | Not using centralized api instance | Use `import api from '@/services/apiClient'` everywhere |
| **CORS or preflight errors** | Manual headers trigger CORS preflight | Let axios handle FormData headers automatically |
| **Socket disconnects immediately** | Token missing in auth object | Ensure `localStorage.getItem('token')` has value |
| **401 after login** | Token not saved to localStorage | Check authService.login() stores the token |

---

## 8️⃣ Checklist for New API Endpoints

- [ ] Use `import { api } from '@/services/apiClient'`
- [ ] For FormData: `api.post('/endpoint', formData)` - NO manual headers
- [ ] For regular requests: `api.get('/endpoint')` - Interceptor adds Authorization
- [ ] Test with `/debug-headers` to verify Authorization header is sent
- [ ] Never use `axios.get()` directly

---

## 9️⃣ Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://airswift-backend-fjt3.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://airswift-backend-fjt3.onrender.com
```

The API URL is hardcoded in `apiClient.ts`. If you need to use env vars, update apiClient.ts:

```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airswift-backend-fjt3.onrender.com/api';
```

---

## 🔟 References

- Axios docs: https://axios-http.com/
- Socket.IO auth: https://socket.io/docs/v4/socket-io-protocol/
- FormData: https://developer.mozilla.org/en-US/docs/Web/API/FormData
