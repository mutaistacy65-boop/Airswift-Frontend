# Login & Registration Testing - Quick Start Guide

This document provides quick instructions to test and debug the authentication flow.

## Quick Start

### 1. **Check Backend is Running**
```bash
# Your backend should be running on the configured API URL
# Default: http://localhost:3001

# Verify the backend is accessible:
curl http://localhost:3001/health  # or equivalent health check
```

### 2. **Start Frontend Development Server**
```bash
cd /workspaces/Airswift-Frontend
npm run dev
```

The frontend will be available at: **http://localhost:3000**

### 3. **Test Account Creation**

Go to: [http://localhost:3000/register](http://localhost:3000/register)

**Test Data:**
- **Full Name**: John Tests
- **Email**: john+test@example.com
- **Password**: TestPassword123!

**Expected Flow:**
1. ✅ Form submits successfully
2. ✅ Redirected to OTP verification page
3. ✅ Check browser console for OTP (Development mode)
4. ✅ Enter OTP and verify
5. ✅ Redirected to login page

### 4. **Test Login**

Go to: [http://localhost:3000/login](http://localhost:3000/login)

**Test Data:**
- **Email**: testuser@example.com
- **Password**: TestPassword123!

**Expected Result:**
- ✅ Login successful
- ✅ Redirected to job-seeker dashboard
- ✅ Token stored in browser localStorage

## Running Automated Tests

### Setup Testing Dependencies

Install required packages:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

Or if the dependencies are already in package.json:
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Specific Test File
```bash
# Test registration page
npm test -- register.test.tsx

# Test login page
npm test -- login.test.tsx

# Test auth context
npm test -- AuthContext.test.tsx
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests in CI Mode (No Watch)
```bash
npm test -- --ci --coverage
```

## Test Files Created

- `__tests__/pages/register.test.tsx` - Registration form tests
- `__tests__/pages/login.test.tsx` - Login form tests
- `__tests__/context/AuthContext.test.tsx` - Auth context integration tests
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Jest setup and mocks

## Test Scenarios Covered

### Registration Tests
- ✅ Form renders correctly
- ✅ Validation errors for empty fields
- ✅ Successful registration with valid data
- ✅ Error display on registration failure
- ✅ Duplicate email handling

### Login Tests
- ✅ Form renders correctly
- ✅ Validation errors for empty fields
- ✅ Successful login with valid credentials
- ✅ Error display for invalid credentials
- ✅ Token storage in localStorage
- ✅ Non-existent user error handling

### Auth Context Tests
- ✅ Initial state verification
- ✅ Login saves token and user data
- ✅ Login redirects to correct dashboard
- ✅ Admin redirect to admin dashboard
- ✅ Logout clears user data
- ✅ Register calls API correctly
- ✅ Error handling for failed login

## Debugging Live

### Browser DevTools

1. **Open DevTools**: Press `F12`
2. **Console Tab**: View login/register responses
3. **Application Tab**: Check localStorage for token
4. **Network Tab**: Monitor API calls and responses

### Useful Console Commands

```javascript
// Check if token exists
localStorage.getItem('token')

// Check user data
JSON.parse(localStorage.getItem('user'))

// Manual login test (in console)
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'testuser@example.com',
    password: 'TestPassword123!'
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

## API Endpoints Being Tested

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Register new account |
| `/api/auth/login` | POST | Login with credentials |
| `/api/auth/send-registration-otp` | POST | Send OTP during registration |
| `/api/auth/verify-registration-otp` | POST | Verify OTP and complete registration |

## Common Issues & Solutions

### Issue: "Cannot reach backend API"
**Solution:**
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS configuration on backend

### Issue: Tests fail with "fetch is not defined"
**Solution:**
- Ensure `jest.setup.js` is being used (check `jest.config.js`)
- Tests mock fetch automatically

### Issue: "localStorage is not defined"
**Solution:**
- Tests mock localStorage automatically via `jest.setup.js`
- This is normal behavior in JSDOM environment

### Issue: Registration OTP not received
**Solution:**
- In development, OTP is logged to console
- Check browser console for "Registration OTP for [email]: [OTP]"
- OTP expires in 5 minutes

## Manual Testing Checklist

- [ ] User can register with valid data
- [ ] User receives OTP and can verify
- [ ] Account is created after OTP verification
- [ ] User can login with new account
- [ ] Token persists on page refresh
- [ ] User is logged out properly
- [ ] Protected routes redirect to login
- [ ] Error messages display correctly
- [ ] Admin users redirect to admin dashboard
- [ ] Regular users redirect to job-seeker dashboard

## Performance Testing

### Test Login Response Time
```bash
# In browser console:
console.time('login');
// Perform login...
console.timeEnd('login');
```

### Suggested Benchmarks
- Registration: < 2 seconds
- Login: < 1 second
- Page redirect: < 500ms

## Next Steps

1. Run the manual tests from the [AUTH_TESTING_GUIDE.md](./AUTH_TESTING_GUIDE.md)
2. Run automated tests: `npm test`
3. Check code coverage: `npm test -- --coverage`
4. Monitor browser DevTools for errors
5. Test all user roles (admin vs job-seeker)
