# 🧪 Authentication Testing - Complete Setup

This directory now has comprehensive testing infrastructure for account creation and login. Choose your testing approach:

## 📋 Quick Links to Documentation

- **[TESTING_QUICK_START.md](./TESTING_QUICK_START.md)** - ⚡ **START HERE** - Quick setup and commands
- **[AUTH_TESTING_GUIDE.md](./AUTH_TESTING_GUIDE.md)** - 📖 Detailed manual testing scenarios
- **[TESTING_SETUP_SUMMARY.md](./TESTING_SETUP_SUMMARY.md)** - 📊 Complete overview of setup

## 🚀 Quick Start (2 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
# Opens http://localhost:3000
```

### 3. Test Registration
Visit: **http://localhost:3000/register**
- Name: John Test
- Email: john+test@example.com
- Password: TestPassword123!
- Submit → OTP verification page
- Check browser console for OTP
- Verify OTP → Account created!

### 4. Test Login
Visit: **http://localhost:3000/login**
- Email: testuser@example.com
- Password: TestPassword123!
- Submit → Redirected to dashboard ✅

## 🏃 Three Ways to Test

### Option 1: Browser Console Testing (Easiest)
Perfect for quick testing without setup:

1. Open DevTools: **F12**
2. Go to Console tab
3. Paste this command:
   ```javascript
   fetch('console-testing-script.js')
     .then(r => r.text())
     .then(code => eval(code))
   ```

### Option 2: Automated Unit Tests (Recommended)
Run comprehensive test suite:

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- register.test.tsx
```

### Option 3: Manual Browser Testing (Most Thorough)
Follow step-by-step scenarios in [AUTH_TESTING_GUIDE.md](./AUTH_TESTING_GUIDE.md)

## 📁 Test Files Created

### Automated Tests
- `__tests__/pages/register.test.tsx` - Registration form tests
- `__tests__/pages/login.test.tsx` - Login form tests
- `__tests__/context/AuthContext.test.tsx` - Auth context integration tests

### Configuration
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Jest setup and mocks

### Manual Testing
- `console-testing-script.js` - Browser console testing script
- `TESTING_QUICK_START.md` - Quick start guide
- `AUTH_TESTING_GUIDE.md` - Detailed manual testing scenarios
- `TESTING_SETUP_SUMMARY.md` - Complete setup overview

## 🎯 What Gets Tested

### Registration Flow
- ✅ Form validation (required fields, email format, password strength)
- ✅ API integration (successful registration)
- ✅ OTP verification (development mode console logging)
- ✅ Error handling (duplicate email, network errors)
- ✅ Redirects (to OTP page, then login page)

### Login Flow
- ✅ Form validation (required fields)
- ✅ API integration (successful login)
- ✅ Token storage (localStorage)
- ✅ Error handling (invalid credentials, network errors)
- ✅ Redirects (to appropriate dashboard based on user role)

### Auth Context
- ✅ State management (login, logout, register)
- ✅ Token persistence (localStorage)
- ✅ User data management
- ✅ Role-based redirects (admin vs job-seeker)
- ✅ Error handling and notifications

## 🔧 Configuration

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
```

### Jest Setup (`jest.setup.js`)
```javascript
import '@testing-library/jest-dom'

// Mock fetch globally
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock window.location
delete global.window.location
global.window.location = { href: '' }
```

## 🐛 Common Issues & Solutions

### Issue: "Cannot reach backend API"
**Solution:**
- Verify backend is running on configured port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is configured on backend

### Issue: Tests fail with "fetch is not defined"
**Solution:**
- Ensure `jest.setup.js` is being loaded (check `jest.config.js`)
- Tests should mock fetch automatically

### Issue: "localStorage is not defined"
**Solution:**
- This is normal in JSDOM test environment
- `jest.setup.js` mocks localStorage automatically

### Issue: Registration OTP not received
**Solution:**
- In development mode, OTP is logged to browser console
- Look for: "Registration OTP for [email]: [OTP]"
- OTP expires in 5 minutes

## 📊 Test Coverage

Current test coverage includes:
- **Registration Page**: Form validation, API calls, error handling
- **Login Page**: Form validation, API calls, token storage
- **Auth Context**: State management, redirects, error handling

### Coverage Goals
- Lines: > 80%
- Functions: > 85%
- Branches: > 75%
- Statements: > 80%

## 🚀 Next Steps

1. **Run Quick Tests**: Follow [TESTING_QUICK_START.md](./TESTING_QUICK_START.md)
2. **Run Automated Tests**: `npm test -- --coverage`
3. **Manual Testing**: Use [AUTH_TESTING_GUIDE.md](./AUTH_TESTING_GUIDE.md)
4. **Debug Issues**: Check browser DevTools and console
5. **Add More Tests**: Extend coverage for additional components

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section in [TESTING_QUICK_START.md](./TESTING_QUICK_START.md)
2. Verify backend is running and accessible
3. Check browser DevTools for errors
4. Run tests individually: `npm test -- [filename]`
5. Check test coverage: `npm test -- --coverage`

## 🎉 You're Ready!

The authentication testing infrastructure is now complete. Choose your preferred testing method and start validating the login/registration flow!