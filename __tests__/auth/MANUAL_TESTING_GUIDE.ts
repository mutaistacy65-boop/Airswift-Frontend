/**
 * Manual Testing Guide for Dual Token Authentication
 * 
 * This file contains step-by-step instructions for manually testing the dual-token
 * authentication system to ensure it works correctly end-to-end.
 */

// ============================================================================
// SETUP: Before Testing
// ============================================================================

/*
1. Ensure .env.local is set up with:
   JWT_ACCESS_SECRET=your_access_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_key_here
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_API_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:3000

2. Start the development server:
   npm run dev

3. Have these tools ready:
   - Browser DevTools (F12)
   - REST client (Postman, Insomnia, or curl)
   - Terminal for running commands
*/

// ============================================================================
// TEST 1: User Registration
// ============================================================================

/*
OBJECTIVE: Verify registration creates user without tokens

STEPS:
1. Go to http://localhost:3000/register
2. Fill in the form:
   - Name: Test User
   - Email: testuser@example.com (use unique email)
   - Password: Password123
   - Role: user
3. Click "Register"

EXPECTED:
- See message: "User registered successfully"
- Verification email sent to inbox/spam
- No tokens stored yet (email not verified)

VERIFY IN DEVTOOLS:
- Open DevTools → Application → Local Storage
- Should NOT see accessToken or refreshToken

CURL EQUIVALENT:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "Password123",
    "role": "user"
  }'

EXPECTED RESPONSE:
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "user": {
    "id": "...",
    "email": "testuser@example.com",
    "name": "Test User",
    "role": "user",
    "isVerified": false
  }
}
*/

// ============================================================================
// TEST 2: Email Verification (Get Access + Refresh Tokens)
// ============================================================================

/*
OBJECTIVE: Verify email and obtain both tokens

STEPS:
1. Extract verification token from email
2. Open http://localhost:3000/verify?token=YOUR_TOKEN_HERE
3. Should see success message and redirect to dashboard
4. You should be auto-logged in

VERIFY IN DEVTOOLS:
- Open DevTools → Application → Local Storage → Look for:
  - accessToken (JWT starting with "eyJ...")
  - refreshToken (JWT starting with "eyJ...")
  - user (JSON with user data)

TOKENS SHOULD DECODE TO:
Access Token Payload:
{
  "id": "user_id_here",
  "email": "testuser@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234568790  // 15 minutes from now
}

Refresh Token Payload:
{
  "id": "user_id_here",
  "email": "testuser@example.com",
  "iat": 1234567890,
  "exp": 1234826790  // 7 days from now
}

CURL EQUIVALENT:
curl http://localhost:3000/api/auth/verify?token=YOUR_TOKEN_HERE

EXPECTED RESPONSE:
{
  "success": true,
  "message": "Email verified successfully!",
  "accessToken": "eyJ...",  // New access token (15 min)
  "refreshToken": "eyJ...", // New refresh token (7 day)
  "user": {
    "id": "...",
    "email": "testuser@example.com",
    "isVerified": true
  }
}
*/

// ============================================================================
// TEST 3: Make API Request with Access Token
// ============================================================================

/*
OBJECTIVE: Verify access token is automatically injected in requests

STEPS:
1. After email verification, you're logged in
2. Open a protected endpoint in browser console:
   fetch('/api/dashboard')
   
3. Check the Network tab in DevTools
   - Find the request to /api/dashboard
   - Go to Headers section
   - Look for: Authorization: Bearer eyJ...

VERIFY IN DEVTOOLS NETWORK TAB:
- Request Headers should include:
  Authorization: Bearer eyJ... (your accessToken)
  Content-Type: application/json

CURL EQUIVALENT (using stored token):
ACCESS_TOKEN=$(node -e "console.log(require('fs').readFileSync('.dev-token', 'utf8'))")
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:3000/api/dashboard

EXPECTED:
- Request succeeds (200 status)
- Response contains dashboard data
*/

// ============================================================================
// TEST 4: Token Refresh Flow (Automatic 401 Handling)
// ============================================================================

/*
OBJECTIVE: Verify access token auto-refreshes on 401

SETUP FOR THIS TEST:
1. Modify /src/lib/authController.ts temporarily to test:
   Change expiresIn: '15m' to expiresIn: '1s' for access token
   
2. Restart dev server: npm run dev

3. Re-login or re-verify to get tokens with 1-second expiry

STEPS:
1. After logging in (with 1-second access token)
2. Wait 2+ seconds (let access token expire)
3. Make API request:
   fetch('/api/dashboard')

WATCH IN DEVTOOLS NETWORK TAB:
You should see TWO requests:
  a) First request to /api/dashboard → 401 Unauthorized
  b) Automatic request to /api/auth/refresh
  c) Second request to /api/dashboard → 200 OK (retry)

VERIFY IN CONSOLE:
The fetch should complete successfully without manual retry!

DETAILED FLOW:
1. apiFetch() gets old accessToken from localStorage
2. Sends request with Authorization: Bearer <old_token>
3. Backend returns 401 (token expired)
4. apiFetch interceptor catches 401
5. Calls refreshAccessToken()
6. Sends POST /api/auth/refresh { refreshToken: "..." }
7. Backend validates refresh token and returns new tokens
8. Frontend stores new accessToken and refreshToken
9. Retries original request with NEW accessToken
10. Request succeeds (200)

CURL EQUIVALENT (to simulate expired token):
# Use old/expired access token
curl -H "Authorization: Bearer eyJ..." \
  http://localhost:3000/api/dashboard

# Should get 401, then manually refresh:
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "..." }'

EXPECTED RESPONSE:
{
  "success": true,
  "accessToken": "eyJ..."  # NEW token (15 min)
  "refreshToken": "eyJ..."  # NEW token (7 day)
}
*/

// ============================================================================
// TEST 5: Refresh Token Rotation
// ============================================================================

/*
OBJECTIVE: Verify old refresh token is invalidated after refresh

STEPS:
1. Get tokens from login/verification
2. Store the original refreshToken somewhere:
   const oldRefreshToken = localStorage.getItem('refreshToken')
   
3. Trigger token refresh (wait for access token to expire)
4. Capture new refreshToken from localStorage:
   const newRefreshToken = localStorage.getItem('refreshToken')

5. Try to use OLD refreshToken:
   curl -X POST http://localhost:3000/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{ "refreshToken": "oldToken..." }'

EXPECTED:
- OLD refresh token should return 401: "Invalid refresh token"
- NEW refresh token should work (get new access token)

SECURITY BENEFIT:
- Token rotation prevents token replay attacks
- If old token is compromised, it becomes useless
*/

// ============================================================================
// TEST 6: Login Flow with Dual Tokens
// ============================================================================

/*
OBJECTIVE: Verify login returns both tokens

STEPS:
1. Go to http://localhost:3000/login
2. Enter credentials:
   Email: testuser@example.com (verified user from TEST 2)
   Password: Password123
3. Click "Login"

VERIFY:
- Redirects to dashboard
- DevTools → Local Storage shows:
  - accessToken
  - refreshToken
  - user

CURL EQUIVALENT:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123"
  }'

EXPECTED RESPONSE:
{
  "success": true,
  "accessToken": "eyJ...",  # 15 min
  "refreshToken": "eyJ...", # 7 day
  "user": {
    "id": "...",
    "email": "testuser@example.com",
    "name": "Test User",
    "role": "user",
    "isVerified": true
  }
}
*/

// ============================================================================
// TEST 7: Protected Route Access
// ============================================================================

/*
OBJECTIVE: Verify auth middleware protects routes

STEPS:
1. Create a protected API endpoint in /src/pages/api/protected-test.ts:

   import { authMiddleware } from '@/lib/middleware/authMiddleware'
   import type { AuthRequest } from '@/lib/middleware/authMiddleware'
   import type { NextApiResponse } from 'next'

   async function handler(req: AuthRequest, res: NextApiResponse) {
     return res.status(200).json({
       message: 'Protected route accessed!',
       userId: req.userId,
       userEmail: req.userEmail,
     })
   }

   export default authMiddleware(handler)

2. Test WITHOUT token:
   curl http://localhost:3000/api/protected-test

3. Test WITH old/invalid token:
   curl -H "Authorization: Bearer invalid_token" \
     http://localhost:3000/api/protected-test

4. Test WITH valid token:
   curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     http://localhost:3000/api/protected-test

EXPECTED RESPONSES:

WITHOUT TOKEN (401):
{
  "message": "No authorization token provided"
}

WITH INVALID TOKEN (401):
{
  "message": "Invalid token"
}

WITH VALID TOKEN (200):
{
  "message": "Protected route accessed!",
  "userId": "...",
  "userEmail": "testuser@example.com"
}
*/

// ============================================================================
// TEST 8: Logout Flow
// ============================================================================

/*
OBJECTIVE: Verify tokens are cleared on logout

STEPS:
1. While logged in (dashboard page)
2. Click logout button
3. Should redirect to login page

VERIFY IN DEVTOOLS:
- Local Storage should be EMPTY:
  - NO accessToken
  - NO refreshToken
  - NO user

VERIFY IN CODE:
AuthService.logout() should:
1. Call /api/auth/logout (optional, backend cleanup)
2. Clear localStorage
3. Redirect to /login

EXPECTED BEHAVIOR:
- Trying to access /dashboard after logout redirects to /login
- All API requests return 401 (no token)
*/

// ============================================================================
// TEST 9: Long-Term Token Usage (7 days)
// ============================================================================

/*
OBJECTIVE: Verify refresh token works for 7 days

SETUP:
This is a MANUAL/TIME-BASED test that's hard to automate.
You can:
1. Temporarily change JWT_REFRESH_SECRET expiry to '5s' for testing
2. Get tokens, wait 6 seconds
3. Try to refresh (should fail with expired token)

EXPECTED:
- Access token (15 min): Good for 15 minutes
- Refresh token (7 days): Good for 7 days
- After 7 days: Refresh token expires, user must login again
*/

// ============================================================================
// TEST 10: Password Reset Flow
// ============================================================================

/*
OBJECTIVE: Verify password reset works end-to-end

STEPS:
1. Go to http://localhost:3000/forgot-password
2. Enter email: testuser@example.com
3. Click "Send Reset Link"
4. Should see: "Check Your Email"
5. Extract token from email
6. Go to http://localhost:3000/reset-password?token=YOUR_TOKEN
7. Enter new password
8. Click "Reset Password"
9. Should redirect to /login
10. Login with NEW password

VERIFY:
- Old password doesn't work
- New password works
- Tokens cleared after reset (must login again)

Reset tokens should:
- Expire after 1 hour (not 7 days)
- Be one-time use (invalidated after reset)
- Not work twice with same token
*/

// ============================================================================
// DEBUGGING TIPS
// ============================================================================

/*
COMMON ISSUES:

1. "401 Unauthorized" on every request
   → Check JWT_ACCESS_SECRET is set in .env.local
   → Check access token isn't malformed
   → Check token header: "Authorization: Bearer <token>"

2. Tokens not persisting after page reload
   → Check localStorage is enabled in browser
   → Look for browser extensions blocking storage
   → Check dev console for storage errors

3. Refresh loop / infinite 401s
   → Check refreshToken is valid (not expired)
   → Check JWT_REFRESH_SECRET is correct
   → Verify refresh token hash matches DB record

4. CORS errors
   → Check NEXT_PUBLIC_API_URL matches backend URL
   → Add CORS headers if calling from different domain

5. Email not sending in forgot-password
   → Check SENDGRID_API_KEY or SMTP config
   → Look at server logs for email errors
   → Try Ethereal Email for testing (leave SMTP empty)

DEBUGGING COMMANDS:

View localStorage in console:
  localStorage.getItem('accessToken')
  localStorage.getItem('refreshToken')

Decode JWT token (at jwt.io):
  1. Copy token value from localStorage
  2. Paste at jwt.io
  3. See payload without verification

Check user in database:
  db.users.findOne({ email: "testuser@example.com" })

Monitor auth requests in Network tab:
  1. Open DevTools → Network
  2. Filter by XHR/Fetch
  3. Make API calls and watch
  4. Check request/response headers and body
*/

// ============================================================================
// AUTOMATED TEST RUNNER
// ============================================================================

/*
To run the automated test suite:

1. In Node.js environment or browser console:

import { runAllTests, printTestResults } from '@/__tests__/auth/testUtils'

const results = runAllTests()
printTestResults(results)

EXPECTED OUTPUT:
========== AUTH SYSTEM TEST RESULTS ==========

📋 Token Storage
----------------------------------------
  ✅ Store Access Token
  ✅ Store Refresh Token
  ✅ Store Both Tokens
  ✅ Clear Tokens

📋 JWT Structure
----------------------------------------
  ✅ JWT Format
  ✅ Access Token Expiry
  ✅ Refresh Token Expiry

... (more test suites)

============================================

📊 SUMMARY: 32/32 tests passed (100%)
*/

// ============================================================================
// CHECKLIST: All Tests Passed?
// ============================================================================

/*
✅ Registration creates user (unverified)
✅ Email verification returns both tokens
✅ Access token injected in API requests
✅ 401 automatically triggers token refresh
✅ Refresh token rotation (old token invalidated)
✅ Login returns both tokens
✅ Protected routes verify token
✅ Logout clears all tokens
✅ Password reset works end-to-end
✅ Automated test suite passes
✅ Token storage persists on page reload
✅ Bearer token format correct
✅ Refresh endpoint works
✅ Token expiry times correct (15min/7day)
✅ API interceptor retry works

If all pass → System is production-ready! 🚀
*/

export {}
