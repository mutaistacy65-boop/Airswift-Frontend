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
4. Type `help()` to see all commands

**Available Commands:**
```javascript
registerNewUser()                    // Register with auto-generated email
loginUser(email, password)           // Test login
checkLoginStatus()                   // Check if logged in
logout()                            // Clear session
runRegistrationFlow()               // Full registration test
runLoginFlow(email, password)       // Full login test
help()                              // Show all commands
```

### Option 2: Manual Testing (Detailed)
Follow step-by-step scenarios in [AUTH_TESTING_GUIDE.md](./AUTH_TESTING_GUIDE.md)

**7 Test Scenarios:**
1. Account Registration (Happy Path)
2. Registration Validation Errors
3. Login (Happy Path)
4. Login - Invalid Credentials
5. Session Persistence
6. Logout
7. Protected Route Access

### Option 3: Automated Testing (CI/CD Ready)
Run 22 automated unit and integration tests:

```bash
# Run all tests
npm test

# Watch mode (re-run on changes)
npm test:watch

# With coverage report
npm test:coverage

# CI mode (no watch)
npm test -- --ci
```

**Test Files:**
- `__tests__/pages/register.test.tsx` - Registration tests
- `__tests__/pages/login.test.tsx` - Login tests
- `__tests__/context/AuthContext.test.tsx` - Context tests

## 🗂️ File Structure

```
Airswift-Frontend/
├── 📄 TESTING_QUICK_START.md          ← Quick reference
├── 📄 AUTH_TESTING_GUIDE.md           ← Detailed manual guide
├── 📄 TESTING_SETUP_SUMMARY.md        ← Complete overview
├── 📄 console-testing-script.js       ← Browser console helpers
│
├── jest.config.js                     ← Jest configuration
├── jest.setup.js                      ← Jest setup & mocks
│
├── __tests__/
│   ├── pages/
│   │   ├── register.test.tsx          ← 7 registration tests
│   │   └── login.test.tsx             ← 6 login tests
│   │
│   ├── context/
│   │   └── AuthContext.test.tsx       ← 9 integration tests
│   │
│   └── helpers/
│       └── testHelpers.ts             ← Reusable test utilities
│
└── package.json                       ← Test scripts added
```

## 📝 npm Scripts

All added to `package.json`:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"test:ci": "jest --ci --coverage"
```

Run with:
```bash
npm test                    # Run tests once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
npm run test:ci           # CI mode
```

## 🎯 Test Coverage

### 22 Automated Tests

**Registration (7 tests)**
- ✅ Form renders
- ✅ Empty field validation
- ✅ Successful registration
- ✅ Error handling
- ✅ Duplicate email detection
- ✅ Password validation
- ✅ Error display

**Login (6 tests)**
- ✅ Form renders
- ✅ Empty field validation
- ✅ Successful login
- ✅ Invalid credentials
- ✅ Token storage
- ✅ Non-existent user

**Auth Context (9 tests)**
- ✅ Initial state
- ✅ Token & user storage
- ✅ Redirect to dashboard
- ✅ Admin redirect
- ✅ Logout functionality
- ✅ Register API call
- ✅ Error handling
- ✅ Session management
- ✅ Role-based flow

## 🔧 Environment Setup

### .env.local Configuration

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend Requirements

Ensure backend API is running with these endpoints:
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/send-registration-otp` - Send OTP
- `POST /api/auth/verify-registration-otp` - Verify OTP

## 📊 Testing Recommendations

### For Development
- Use **Browser Console Testing** for quick feedback
- Use **Manual Testing** for QA and edge cases
- Use **Watch Mode** (`npm run test:watch`) during development

### For CI/CD
```bash
npm run test:ci          # Run once with coverage
npm run build            # Verify build succeeds
npm run lint            # Check code quality
```

### For Code Review
Generate and review coverage:
```bash
npm run test:coverage
# Check coverage/lcov-report/index.html
```

## 🐛 Debugging Tips

### In Browser Console
```javascript
// Check current login status
checkLoginStatus()

// See all stored auth data
displayAuthData()

// Manually test login
loginUser('testuser@example.com', 'TestPassword123!')

// Clear all data
clearAllAuthData()

// Check API connectivity
testApiConnectivity()
```

### In Terminal
```bash
# Run specific test file
npm test register.test.tsx

# Run specific test case
npm test -- -t "should render login form"

# Verbose output
npm test -- --verbose

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Browser DevTools
- **Console**: See login/register responses
- **Application**: Check localStorage for token
- **Network**: Monitor API calls and responses

## 🚦 Common Test Scenarios

### Scenario 1: Complete Registration Flow
```javascript
// In browser console
await runRegistrationFlow()
// Then go to /verify-otp and enter OTP
```

### Scenario 2: Complete Login Flow
```javascript
// In browser console
await runLoginFlow('testuser@example.com', 'TestPassword123!')
// Should see "Login successful"
```

### Scenario 3: Test Session Persistence
1. Login successfully
2. Refresh page (F5)
3. Check: `checkLoginStatus()` - should show logged in

### Scenario 4: Test Error Handling
```javascript
// In browser console
await loginWithWrongPassword('testuser@example.com')
// Should show error message
```

## ✅ Checklist

Before deploying, verify:
- [ ] Unit tests pass: `npm test`
- [ ] Coverage target met: `npm run test:coverage`
- [ ] Manual registration works
- [ ] Manual login works
- [ ] Session persists on refresh
- [ ] Logout clears session
- [ ] Error messages display
- [ ] Protected routes protected
- [ ] All user roles tested

## 📞 Support & Next Steps

1. **Quick Test?** → See [TESTING_QUICK_START.md](./TESTING_QUICK_START.md)
2. **Detailed Manual?** → See [AUTH_TESTING_GUIDE.md](./AUTH_TESTING_GUIDE.md)
3. **Complete Overview?** → See [TESTING_SETUP_SUMMARY.md](./TESTING_SETUP_SUMMARY.md)
4. **Run Tests?** → `npm test`
5. **Browser Testing?** → Open DevTools console and run `help()`

## 🎓 Key Commands to Remember

```bash
# Install everything
npm install

# Start development
npm run dev

# Run all tests
npm test

# Run tests continuously
npm run test:watch

# Get coverage report
npm run test:coverage

# Quick browser test
# Open DevTools Console and run: help()
```

## 📚 Files Created/Modified

**Documentation:**
- ✅ TESTING_SETUP_SUMMARY.md - Overview
- ✅ TESTING_QUICK_START.md - Quick reference
- ✅ AUTH_TESTING_GUIDE.md - Detailed guide
- ✅ console-testing-script.js - Browser helpers
- ✅ __tests__/helpers/testHelpers.ts - Test utilities

**Configuration:**
- ✅ jest.config.js - Jest setup
- ✅ jest.setup.js - Jest mocks
- ✅ package.json - Test scripts + dependencies

**Tests:**
- ✅ __tests__/pages/register.test.tsx
- ✅ __tests__/pages/login.test.tsx
- ✅ __tests__/context/AuthContext.test.tsx

---

**Ready to test?** Start with **[TESTING_QUICK_START.md](./TESTING_QUICK_START.md)** ⚡
