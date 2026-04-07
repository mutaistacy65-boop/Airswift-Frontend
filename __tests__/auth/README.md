# Authentication System Testing Guide

Complete testing setup for the dual-token authentication system.

## 📋 Files in This Directory

- **testUtils.ts** - Core testing utilities with 7 test suites covering all auth scenarios
- **testRunner.ts** - Interactive test runner with diagnostics (can be called from browser console)
- **MANUAL_TESTING_GUIDE.ts** - Step-by-step manual testing instructions
- **README.md** - This file

## 🚀 Quick Start

### Option 1: Automated Tests (Browser Console)

```bash
# 1. Start dev server
npm run dev

# 2. Open browser and go to http://localhost:3000

# 3. Open DevTools (F12) → Console

# 4. Run tests:
testRunner.fullDiagnostics()
```

### Option 2: Node.js Test Runner

```bash
# Create a test script in your project root:
# run-auth-tests.js

import { runAllTests, printTestResults } from './__tests__/auth/testUtils.ts'

const results = runAllTests()
printTestResults(results)
```

Then run:
```bash
node --loader tsx run-auth-tests.js
```

### Option 3: Manual Testing

Follow the step-by-step guide in `MANUAL_TESTING_GUIDE.ts`:

1. User Registration
2. Email Verification (get tokens)
3. API requests with token injection
4. Automatic token refresh on 401
5. Token rotation verification
6. Login/Logout flow
7. Protected routes
8. Password reset
9. And more...

## 📊 Test Coverage

### Test Suites

| Suite | Tests | Coverage |
|-------|-------|----------|
| Token Storage | 4 | localStorage operations |
| JWT Structure | 3 | Token format and expiry |
| Token Refresh | 5 | 401 handling, token rotation |
| API Interceptor | 5 | Bearer injection, retry logic |
| Auth Middleware | 5 | Token extraction, validation |
| Login Flow | 4 | Login endpoint and token storage |
| Logout Flow | 3 | Token clearance on logout |
| **TOTAL** | **32** | **Complete auth system** |

### What Gets Tested

✅ Token generation and storage  
✅ Token format (JWT structure)  
✅ Bearer token injection in requests  
✅ 401 interception and retry  
✅ Automatic token refresh  
✅ Token rotation on refresh  
✅ Auth middleware verification  
✅ Protected route access  
✅ Login/logout flows  
✅ Error handling  

## 🎯 Testing Workflow

### For Developers

```typescript
// In browser console while dev server is running:

// 1. Run full diagnostics
testRunner.fullDiagnostics()

// 2. Check quick status
testRunner.quickCheck()

// 3. Test specific functionality
testRunner.testTokenGeneration()
testRunner.testStorageFunctionality()
testRunner.testAuthFlowSimulation()

// 4. Help
testRunner.help()
```

### For CI/CD Pipeline

```bash
# Add to package.json scripts:
"test:auth": "jest __tests__/auth/*.test.ts"
"test:auth:quick": "node -e \"import('./run-auth-tests.js')\""

# Run in CI:
npm run test:auth
```

### For Manual QA

1. Follow `MANUAL_TESTING_GUIDE.ts` step by step
2. Test with real browser and network traffic
3. Verify token refresh in Network tab (DevTools)
4. Confirm localStorage persistence across page reloads

## 🔍 Test Results Interpretation

### Successful Output

```
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
```

### Failure Investigation

If tests fail, check:

1. **Token Storage Tests Fail**
   - localStorage might be disabled
   - Browser privacy settings blocking storage
   - Check browser console errors

2. **JWT Structure Tests Fail**
   - Verify JWT expirey times in code:
     - Access token: 15 minutes (900 sec)
     - Refresh token: 7 days (604800 sec)

3. **Token Refresh Tests Fail**
   - Check `/api/auth/refresh` endpoint exists
   - Verify JWT_REFRESH_SECRET in .env.local
   - Check database schema has refreshToken field

4. **API Interceptor Tests Fail**
   - Verify `/src/utils/apiFetch.ts` imported correctly
   - Check Bearer token format: "Bearer " + token
   - Verify Content-Type header set to application/json

5. **Auth Middleware Tests Fail**
   - Check `/src/lib/middleware/authMiddleware.ts` exists
   - Verify JWT_ACCESS_SECRET matches login/verify endpoints
   - Test with curl: `curl -H "Authorization: Bearer token" http://localhost:3000/api/protected`

## 🛠️ Test Utilities

### generateMockTokens()
Creates mock tokens for testing
```typescript
const tokens = generateMockTokens('user-123', 'user@example.com')
// { accessToken, refreshToken, userId, email }
```

### setupLocalStorageMock()
Creates in-memory localStorage for testing
```typescript
const storage = setupLocalStorageMock()
storage.setItem('accessToken', 'token...')
storage.getItem('accessToken') // 'token...'
```

### createMockFetchResponse()
Creates mock fetch responses
```typescript
const response = createMockFetchResponse(
  { success: true },
  200,
  { 'Content-Type': 'application/json' }
)
```

### runAllTests()
Runs all 7 test suites
```typescript
const results = runAllTests()
// Returns object with all test results
```

### printTestResults()
Formats and prints results
```typescript
printTestResults(results)
// Prints formatted table to console
```

## 📈 Test Metrics

Track these metrics as you develop:

- **Pass Rate**: Target 100% (32/32)
- **Coverage**: All 7 test suites
- **Response Time**: < 100ms for token operations
- **Storage Size**: Access token ~500 bytes, Refresh token ~500 bytes

## 🚨 Common Issues & Solutions

### "401 Unauthorized" on every request

**Cause**: Access token not being sent or invalid

**Solution**:
```bash
# Check token in localStorage
localStorage.getItem('accessToken')

# Verify Bearer format
# Should be: "Bearer eyJ..."

# Check JWT_ACCESS_SECRET in backend
console.log(process.env.JWT_ACCESS_SECRET)

# Decode token at jwt.io
# Verify exp claim is in future
```

### Tokens not persisting after reload

**Cause**: localStorage disabled or clear on exit

**Solution**:
- Check browser settings
- Check for custom storage middleware
- Look for extensions blocking localStorage

### Token refresh loop

**Cause**: Refresh token invalid or expired

**Solution**:
```bash
# Check refresh token in DB
db.users.findOne({ email: "test@example.com" }, { refreshToken: 1 })

# Verify expiry time
# Should be 7 days from now

# Check JWT_REFRESH_SECRET
console.log(process.env.JWT_REFRESH_SECRET === process.env.JWT_ACCESS_SECRET)
# Should be false - they're different secrets!
```

### CORS errors

**Cause**: Different domains and missing headers

**Solution**:
```bash
# Verify NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_API_URL

# Should match backend URL
# Add CORS middleware if needed
```

## 📚 Related Files

- `/src/utils/apiFetch.ts` - API interceptor being tested
- `/src/lib/middleware/authMiddleware.ts` - Middleware being tested
- `/src/lib/models/User.ts` - User schema with refreshToken
- `/src/pages/api/auth/refresh.ts` - Refresh endpoint being tested
- `DUAL_TOKEN_SYSTEM.md` - Architecture documentation

## 🎓 Learning Resources

- [JWT Introduction](https://jwt.io/introduction)
- [OAuth 2.0 Refresh Token Pattern](https://tools.ietf.org/html/rfc6749#section-6)
- [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## ✅ Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All 32 tests passing
- [ ] `testRunner.fullDiagnostics()` shows "READY"
- [ ] Manual test checklist completed
- [ ] JWT secrets set in production .env
- [ ] Token expiry times appropriate for use case
- [ ] MongoDB indices on email field
- [ ] Rate limiting on auth endpoints
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Error messages don't leak sensitive info

## 🤝 Contributing

When adding new auth features:

1. Add test cases to `testUtils.ts`
2. Update `testRunner.ts` with new tests
3. Document in `MANUAL_TESTING_GUIDE.ts`
4. Run full test suite before PR

## 💬 Questions?

Refer to:
- `MANUAL_TESTING_GUIDE.ts` - Step-by-step procedures
- `DUAL_TOKEN_SYSTEM.md` - Architecture details
- `/src/lib/middleware/authMiddleware.ts` - Middleware implementation
- `/src/utils/apiFetch.ts` - API interceptor code
