# Dual Token Authentication System 🔐

Complete implementation of access token + refresh token pattern with automatic token refresh.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Components/Pages                                │   │
│  │  - Uses apiFetch() for all API calls            │   │
│  │  - Stores accessToken + refreshToken in LS      │   │
│  └──────────────────────────────────────────────────┘   │
│                          ↓                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  apiFetch Interceptor (src/utils/apiFetch.ts)   │   │
│  │  - Injects Bearer token in headers              │   │
│  │  - Catches 401 responses                        │   │
│  │  - Calls /api/auth/refresh                      │   │
│  │  - Retries request with new token              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 Backend (Next.js API)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Auth Endpoints                                  │   │
│  │  - /api/auth/login (returns both tokens)        │   │
│  │  - /api/auth/verify (returns both tokens)       │   │
│  │  - /api/auth/refresh (rotates refresh token)    │   │
│  │  - /api/auth/logout                             │   │
│  └──────────────────────────────────────────────────┘   │
│              JWT_ACCESS_SECRET ↑ JWT_REFRESH_SECRET      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Protected Routes (authMiddleware)               │   │
│  │  - Verify Bearer token                          │   │
│  │  - Attach user info to request                  │   │
│  │  - Return 401 if invalid/expired                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              MongoDB (User Collection)                   │
│  {                                                      │
│    _id: ObjectId,                                       │
│    email: string,                                       │
│    refreshToken: "hash...",  // SHA256 hashed           │
│    isVerified: boolean,                                 │
│    ...                                                  │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

## Token Flow

### 1. Login/Verification Flow

```
User enters credentials → POST /api/auth/login
                              ↓
                        Backend generates:
                        - accessToken (JWT, 15 min)
                        - refreshToken (JWT, 7 day)
                        - Hash refreshToken + store in DB
                              ↓
                        Returns both tokens to frontend
                              ↓
Frontend stores in localStorage:
- localStorage.setItem('accessToken', token)
- localStorage.setItem('refreshToken', token)
```

### 2. API Request Flow

```
Frontend: apiFetch('/api/resource')
                    ↓
Gets accessToken from localStorage
Adds: Authorization: Bearer <accessToken>
Sends request to backend
                    ↓
Backend authMiddleware:
- Extracts token from Authorization header
- Verifies with JWT_ACCESS_SECRET
- Attaches user info to request
- Handler processes request
                    ↓
Returns response (200, 403, 500, etc)
```

### 3. Token Refresh Flow (Automatic)

```
Frontend: apiFetch('/api/resource')
                    ↓
Backend returns: 401 Unauthorized
(accessToken expired)
                    ↓
apiFetch interceptor catches 401
Gets refreshToken from localStorage
Calls POST /api/auth/refresh
  { refreshToken: "..." }
                    ↓
Backend /api/auth/refresh:
- Verifies refreshToken JWT signature
- Hashes incoming token
- Validates: refreshToken hash matches DB
- Generates new accessToken (15 min)
- Generates new refreshToken (7 day)
- Stores new hashed refreshToken in DB
- Returns both tokens
                    ↓
Frontend updates localStorage
localStorage.setItem('accessToken', new_token)
localStorage.setItem('refreshToken', new_token)
                    ↓
Retries original request with new accessToken
apiFetch('/api/resource') [with new token]
                    ↓
Backend processes request successfully (200)
```

## Implementation Details

### Backend Files

#### 1. User Model (`/src/lib/models/User.ts`)
```typescript
interface IUser extends Document {
  // ... existing fields
  refreshToken?: string  // NEW: Hashed refresh token storage
}

const userSchema = new Schema<IUser>({
  // ... existing fields
  refreshToken: {
    type: String,
    default: null,  // Cleared on logout
  },
})
```

#### 2. Auth Middleware (`/src/lib/middleware/authMiddleware.ts`)
```typescript
/**
 * Higher-order function to protect routes
 * Usage: export default function handler(req, res) {}
 * const protectedHandler = authMiddleware(handler)
 */
export const authMiddleware = (handler: any) => {
  return async (req: AuthRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json(...)
    
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET)
    req.userId = decoded.id
    req.userEmail = decoded.email
    req.userRole = decoded.role
    
    return handler(req, res)
  }
}

// Usage in protected endpoint:
async function handler(req: AuthRequest, res: NextApiResponse) {
  const userId = req.userId  // Now available
  // ... handler logic
}
export default authMiddleware(handler)
```

#### 3. Refresh Endpoint (`/src/pages/api/auth/refresh.ts`)
```typescript
/**
 * POST /api/auth/refresh
 * Body: { refreshToken: "..." }
 * 
 * Returns: {
 *   success: true,
 *   accessToken: "new jwt (15 min)",
 *   refreshToken: "new jwt (7 day)",
 * }
 */
```

**Token Rotation Process:**
1. Verify refresh token JWT signature with JWT_REFRESH_SECRET
2. Find user in database
3. Hash incoming refreshToken with SHA256
4. Compare with stored user.refreshToken (hashed)
5. If matches: Generate new access + refresh tokens
6. Hash new refreshToken and store in database
7. Return both new tokens to frontend

**Security:**
- Old refresh token is invalidated (replaced with new one)
- If token leaked, attacker can't reuse it (new token generated)
- All refresh tokens stored hashed in database
- 7-day expiry prevents indefinite token usage

#### 4. Updated Auth Controller (`/src/lib/authController.ts`)
```typescript
// Separate secrets for each token type
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret'

// Access token: short-lived (15 minutes)
const signJwt = (user: any) =>
  jwt.sign({ id, email, role }, JWT_ACCESS_SECRET, { expiresIn: '15m' })

// Refresh token: long-lived (7 days)
const signRefreshToken = (user: any) =>
  jwt.sign({ id, email }, JWT_REFRESH_SECRET, { expiresIn: '7d' })

// Login stores both tokens
const token = signJwt(user)
const refreshToken = signRefreshToken(user)
const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex')
user.refreshToken = hashedRefreshToken
await user.save()

return res.status(200).json({
  success: true,
  accessToken: token,
  refreshToken: refreshToken,  // Send raw token (not hashed)
  user: sanitizeUser(user),
})
```

### Frontend Files

#### 1. API Interceptor (`/src/utils/apiFetch.ts`)
```typescript
/**
 * Automatic token refresh and retry pattern
 */
export async function apiFetch(url: string, options = {}): Promise<Response> {
  // Get current accessToken from localStorage
  let accessToken = localStorage.getItem('accessToken')
  
  // First attempt
  let response = await fetch(API_URL + url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  })
  
  // Handle 401 - token expired
  if (response.status === 401) {
    // Refresh tokens
    const newAccessToken = await refreshAccessToken()
    
    if (newAccessToken) {
      // Retry with new token
      response = await fetch(API_URL + url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      })
    }
  }
  
  return response
}

/**
 * Token refresh helper
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken')
  
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  
  if (!response.ok) {
    // Clear tokens, redirect to login
    clearAuthTokens()
    return null
  }
  
  const data = await response.json()
  
  if (data.accessToken && data.refreshToken) {
    // Store new tokens
    storeAuthTokens(data.accessToken, data.refreshToken)
    return data.accessToken
  }
  
  return null
}

// Helper functions
export function storeAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

export function clearAuthTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken')
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken')
}
```

#### 2. Updated Auth Service (`/src/services/authService.ts`)
```typescript
import { apiFetch, storeAuthTokens, clearAuthTokens } from '@/utils/apiFetch'

const AuthService = {
  login: async (email: string, password: string) => {
    // ... send credentials
    if (data.accessToken && data.refreshToken) {
      storeAuthTokens(data.accessToken, data.refreshToken)
    }
    return data
  },

  verifyEmail: async (token: string) => {
    // ... verify token
    // On success, store both tokens
    if (data.accessToken && data.refreshToken) {
      storeAuthTokens(data.accessToken, data.refreshToken)
    }
    return data
  },

  logout: async () => {
    // Call logout endpoint
    await apiFetch('/api/auth/logout', { method: 'POST' })
    // Clear tokens
    clearAuthTokens()
  },

  // New methods for token access
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
}
```

## Token Expiry Times

| Token Type | Expiry | Purpose | Usage |
|-----------|--------|---------|-------|
| Access Token | 15 minutes | API requests | Every request via Bearer token |
| Refresh Token | 7 days | Obtain new access token | Only on 401 response |
| Email Verification | 10 minutes | Verify email address | Single-use verification link |
| Password Reset | 1 hour | Reset password | Single-use reset link |

## Environment Configuration

```bash
# .env.local or .env.production

# Required
JWT_ACCESS_SECRET=your_super_secret_access_key_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_32_chars

# Optional (fallback)
JWT_SECRET=your_legacy_secret_key

# Database
MONGODB_URI=mongodb+srv://...

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Email (existing)
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@yourdomain.com
```

## Usage Examples

### Protected API Endpoint

```typescript
// /src/pages/api/protected-route.ts
import { authMiddleware } from '@/lib/middleware/authMiddleware'
import type { AuthRequest } from '@/lib/middleware/authMiddleware'

async function handler(req: AuthRequest, res: NextApiResponse) {
  // AuthMiddleware already verified token
  const userId = req.userId  // Available from middleware
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Your handler logic
  return res.status(200).json({ userId, data: '...' })
}

export default authMiddleware(handler)
```

### Frontend Component Using apiFetch

```typescript
// src/components/Dashboard.tsx
import { useEffect, useState } from 'react'
import { apiFetch } from '@/utils/apiFetch'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiFetch('/api/dashboard/data')
        const json = await response.json()
        
        if (response.ok) {
          setData(json.data)
        } else {
          console.error('Error:', json.message)
        }
      } catch (error) {
        console.error('Fetch error:', error)
      }
    }

    fetchData()
  }, [])

  return <div>{/* Component JSX */}</div>
}
```

### Login Flow

```typescript
// src/pages/login.tsx
const handleLogin = async () => {
  const data = await AuthService.login(email, password)
  
  // AccessToken + RefreshToken automatically stored by AuthService
  // Redirect to dashboard
  router.push('/dashboard')
}
```

### Logout

```typescript
const handleLogout = async () => {
  await AuthService.logout()
  // Tokens cleared and user redirected to login
  router.push('/login')
}
```

## Testing the Flow

### 1. Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "success": true,
#   "accessToken": "eyJhbG...",  # 15 min
#   "refreshToken": "eyJhbG...", # 7 day
#   "user": { "id": "...", "email": "...", ... }
# }
```

### 2. Use Access Token
```bash
# Store tokens in variables
ACCESS_TOKEN="eyJhbG..."
REFRESH_TOKEN="eyJhbG..."

# Make protected request
curl -X GET http://localhost:3000/api/protected \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Response (200):
# { "success": true, "data": "..." }
```

### 3. Wait for Token to Expire (simulate 15+ min)
```bash
# Or modify expiresIn in code to '1s' for testing

# Try with expired token
curl -X GET http://localhost:3000/api/protected \
  -H "Authorization: Bearer $EXPIRED_ACCESS_TOKEN"

# Response (401):
# { "message": "Invalid token" }
```

### 4. Test Token Refresh
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "'$REFRESH_TOKEN'" }'

# Response:
# {
#   "success": true,
#   "accessToken": "eyJhbG..." # NEW token (15 min)
#   "refreshToken": "eyJhbG..." # NEW token (7 day)
# }
```

## Security Checklist

✅ Refresh tokens stored as SHA256 hashes in database (never plaintext)
✅ Access token short-lived (15 min) - limited exposure window
✅ Refresh token long-lived (7 day) - convenience for users  
✅ Token rotation on refresh - old token invalidated
✅ Bearer token in Authorization header (not in URL)
✅ JWT signature verification with separate secrets
✅ Automatic retry on 401 transparent to frontend
✅ Clear tokens on logout and failed refresh
✅ Password hashing with bcryptjs (not plain)
✅ Email verification required before login
✅ Rate limiting on auth endpoints (optional enhancement)

## Troubleshooting

### "Invalid refresh token"
- Refresh token expired (7 days old)
- User cleared cookies/localStorage
- Database record was deleted/modified
- Token was modified in transit

### "Token expired" on new request
- Access token is only valid 15 minutes
- Frontend should use apiFetch() which auto-refreshes
- Check that apiFetch is being used, not vanilla fetch

### "401 Unauthorized on protected route"
- No Authorization header sent
- Check Browser DevTools Network tab
- Verify authMiddleware is properly applied
- Check JWT_ACCESS_SECRET matches

### Tokens not persisting across page reload
- localStorage not enabled in browser
- Check browser cookies/storage settings
- Ensure httpOnly is false for localStorage

### Infinite redirect loop on refresh
- refreshAccessToken() returning null
- Catch in apiFetch, redirect to /login
- Check refreshToken stored in localStorage
- Verify /api/auth/refresh endpoint working

## Next Steps

1. ✅ Dual token system implemented
2. ✅ API interceptor with auto-refresh
3. ✅ Auth middleware for protected routes
4. ✅ Token rotation on refresh
5. ⏳ Test end-to-end flow
6. ⏳ Create forgot-password.tsx page
7. ⏳ Add rate limiting (optional)
8. ⏳ Setup production secrets
9. ⏳ Monitor token refresh patterns
10. ⏳ Add refresh token revocation list (advanced)

## References

- [RFC 6749 - OAuth 2.0](https://tools.ietf.org/html/rfc6749) - Authorization Framework
- [JWT.io](https://jwt.io) - JWT debugger and specification
- [OWASP - Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Node.js jsonwebtoken docs](https://github.com/auth0/node-jsonwebtoken)
