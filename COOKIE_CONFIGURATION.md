# Cookie Configuration Guide

## ⚠️ CRITICAL: Backend Cookie Settings

When your backend API sets authentication tokens as cookies, it MUST use these settings:

### Node.js / Express Backend

```javascript
res.cookie("accessToken", token, {
  httpOnly: true,        // ✅ Prevents XSS attacks - JS cannot access
  secure: true,          // ✅ REQUIRED on HTTPS (Vercel, Render, production)
  sameSite: "none",      // ✅ REQUIRED for cross-origin requests
  maxAge: 7 * 24 * 60 * 60 * 1000, // Optional: 7 days expiration
  domain: ".yourdomain.com" // Optional: for subdomain sharing
});
```

### Next.js API Route Backend

```typescript
import { serialize } from 'cookie';

res.setHeader('Set-Cookie', serialize('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60, // seconds
  path: '/',
}));
```

## ✅ Frontend Configuration (Already Done)

The frontend is already properly configured to:

1. **Send cookies with requests:**
   - `axios.defaults.withCredentials = true` (in `_app.tsx`)
   - `withCredentials: true` in all axios instances
   - `credentials: 'include'` in fetch calls

2. **Read cookies:**
   - Middleware checks `req.cookies.get("token")` or `req.cookies.get("accessToken")`
   - API routes check `req.cookies.token` from Authorization header fallback

## 🔍 Why These Settings Matter

| Setting | Purpose | Impact if Missing |
|---------|---------|-------------------|
| `httpOnly: true` | Prevents JavaScript XSS attacks | Cookie accessible to malicious JS |
| `secure: true` | Only sent over HTTPS | Cookie sent over HTTP (insecure) |
| `sameSite: "none"` | Allows cross-origin requests | Cookies not sent in cross-origin requests (CORS fails) |

## 🚀 Deployment Checklist

- [ ] Backend sets cookies with `sameSite: "none"`
- [ ] Backend sets `secure: true` on production HTTPS
- [ ] Frontend has `withCredentials: true` globally
- [ ] CORS is configured on backend: `credentials: true`
- [ ] Both frontend and backend have matching cookie domain
- [ ] Test login flow works end-to-end with cookies

## 🧪 Testing

### Browser DevTools
1. Open DevTools → Application → Cookies
2. After login, verify `accessToken` or `token` cookie exists
3. Check cookie properties:
   - ✅ HttpOnly: checked
   - ✅ Secure: checked (if HTTPS)
   - ✅ SameSite: None

### Network Tab
1. Open DevTools → Network tab
2. Make a request to backend API
3. Check "Request Headers" → Cookie header sent
4. Check "Response Headers" → Set-Cookie header present (if setting cookie)

## 📝 Backend Integration Example

```typescript
// Express.js example
app.post('/api/auth/login', (req, res) => {
  // ... authentication logic ...
  
  const token = jwt.sign({ userId: user.id }, SECRET);
  
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: true,        // Enable on HTTPS
    sameSite: 'none',    // Critical for CORS
  });
  
  res.json({ 
    message: 'Login successful',
    user: { id: user.id, email: user.email }
  });
});
```

## 🆘 Common Issues

**Problem:** Cookies not being sent with requests
- **Solution:** Verify `withCredentials: true` on frontend AND `sameSite: "none"` on backend

**Problem:** 401 Unauthorized on API calls
- **Solution:** Check that cookies are being sent (use Network tab) and backend reads them correctly

**Problem:** CORS errors with cookies
- **Solution:** Backend must set `sameSite: "none"` and `secure: true`, plus `credentials: true` in CORS config

**Problem:** Works locally but not on production
- **Solution:** Ensure `secure: true` is set on production HTTPS deployment
