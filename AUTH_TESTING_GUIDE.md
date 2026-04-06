# Authentication Testing Guide - Manual Testing Scenarios

This guide provides detailed manual testing scenarios for the authentication flow including account registration, login, and session management.

## 📋 Prerequisites

### Environment Setup
- ✅ Backend API running (default: http://localhost:3001)
- ✅ Frontend development server running (`npm run dev`)
- ✅ Database connected and accessible
- ✅ Email service configured (for OTP in production)

### Test Data
**Valid Test Account:**
- Name: John Test
- Email: testuser@example.com
- Password: TestPassword123!

**Invalid Test Data:**
- Empty fields
- Invalid email formats
- Wrong passwords
- Non-existent emails

## 🔄 Authentication Flow Overview

```
Registration → OTP Verification → Login → Dashboard Redirect
     ↓              ↓              ↓            ↓
   /register   /verify-otp      /login     /dashboard (role-based)
```

## 🧪 Manual Test Scenarios

### Scenario 1: Account Registration (Happy Path)

**Objective:** Verify successful account creation with OTP verification

**Steps:**
1. Navigate to `/register`
2. Fill form with valid data:
   - Full Name: John Test
   - Email: john+test@example.com
   - Password: TestPassword123!
3. Click "Register" button
4. **Expected:** Redirected to OTP verification page
5. Open browser DevTools (F12) → Console tab
6. **Expected:** See OTP code logged: "Registration OTP for john+test@example.com: [6-digit code]"
7. Enter the OTP code in the verification form
8. Click "Verify OTP"
9. **Expected:** Success message and redirect to login page

**Success Criteria:**
- ✅ Form submits without errors
- ✅ OTP verification page loads
- ✅ OTP appears in console (development mode)
- ✅ OTP verification succeeds
- ✅ Redirect to login page
- ✅ Account created in database

---

### Scenario 2: Registration Validation Errors

**Objective:** Verify form validation prevents invalid submissions

**Test Cases:**

#### Empty Fields
1. Navigate to `/register`
2. Click "Register" without filling any fields
3. **Expected:** Error messages for all required fields

#### Invalid Email Format
1. Enter name and password
2. Enter invalid email: "invalid-email"
3. Click "Register"
4. **Expected:** Email validation error

#### Duplicate Email
1. Try to register with existing email: testuser@example.com
2. **Expected:** "Email already exists" error

#### Weak Password
1. Enter valid name and email
2. Enter weak password: "123"
3. **Expected:** Password strength validation error

**Success Criteria:**
- ✅ All validation errors display correctly
- ✅ Form prevents submission with invalid data
- ✅ Error messages are clear and helpful

---

### Scenario 3: Login (Happy Path)

**Objective:** Verify successful login with valid credentials

**Steps:**
1. Navigate to `/login`
2. Enter valid credentials:
   - Email: testuser@example.com
   - Password: TestPassword123!
3. Click "Login" button
4. **Expected:** Successful login and redirect to dashboard

**Success Criteria:**
- ✅ Login succeeds without errors
- ✅ Token stored in localStorage
- ✅ User data stored in localStorage
- ✅ Redirect to appropriate dashboard (job-seeker or admin)
- ✅ No error messages displayed

---

### Scenario 4: Login - Invalid Credentials

**Objective:** Verify proper error handling for invalid login attempts

**Test Cases:**

#### Wrong Password
1. Navigate to `/login`
2. Enter valid email, wrong password
3. Click "Login"
4. **Expected:** "Invalid credentials" error

#### Non-existent Email
1. Enter non-existent email, any password
2. Click "Login"
3. **Expected:** "User not found" or "Invalid credentials" error

#### Empty Fields
1. Click "Login" without entering anything
2. **Expected:** Validation errors for required fields

**Success Criteria:**
- ✅ Appropriate error messages displayed
- ✅ Form remains accessible for retry
- ✅ No sensitive information leaked in errors

---

### Scenario 5: Session Persistence

**Objective:** Verify user session persists across page refreshes

**Steps:**
1. Login successfully (see Scenario 3)
2. Refresh the page (F5)
3. **Expected:** User remains logged in, no redirect to login
4. Check browser DevTools → Application → localStorage
5. **Expected:** `token` and `user` keys exist with valid data

**Success Criteria:**
- ✅ User session persists on page refresh
- ✅ Token remains valid
- ✅ User data accessible throughout session

---

### Scenario 6: Logout Functionality

**Objective:** Verify logout clears session properly

**Steps:**
1. Login successfully
2. Click logout button (if available) or manually clear localStorage
3. Refresh the page
4. **Expected:** Redirected to login page
5. Try to access protected route (e.g., `/job-seeker/dashboard`)
6. **Expected:** Redirected to login page

**Success Criteria:**
- ✅ Session data cleared from localStorage
- ✅ Protected routes redirect to login
- ✅ Cannot access dashboard without authentication

---

### Scenario 7: Role-Based Access Control

**Objective:** Verify different user roles access appropriate dashboards

**Test Accounts:**

#### Job Seeker Role
- Login with regular user account
- **Expected:** Redirect to `/job-seeker/dashboard`

#### Admin Role
- Login with admin account (if available)
- **Expected:** Redirect to `/admin` or `/admin/dashboard`

#### Unauthorized Access
- Try to access admin routes as job-seeker
- **Expected:** Redirect to `/unauthorized` or login

**Success Criteria:**
- ✅ Role-based redirects work correctly
- ✅ Admin routes protected from regular users
- ✅ Appropriate error pages for unauthorized access

## 🔧 Debugging Tips

### Browser DevTools
1. **Console Tab:** Check for API errors and OTP codes
2. **Network Tab:** Monitor API calls and responses
3. **Application Tab:** Inspect localStorage for token/user data

### Common Issues

#### "Cannot reach backend API"
- Verify backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure CORS is configured on backend

#### "OTP not received"
- In development, check browser console for OTP
- Look for: "Registration OTP for [email]: [OTP]"
- OTP expires in 5 minutes

#### "Login fails"
- Verify backend is running
- Check API endpoint URLs
- Ensure database connection is working

### Useful Console Commands

```javascript
// Check if token exists
localStorage.getItem('token')

// Check user data
JSON.parse(localStorage.getItem('user'))

// Manual API test
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

## 📊 Response Format Examples

### Successful Registration
```json
{
  "success": true,
  "message": "Registration initiated. Please verify your email.",
  "userId": "user_id_here"
}
```

### Successful Login
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Test",
    "email": "testuser@example.com",
    "role": "user"
  }
}
```

### OTP Verification Success
```json
{
  "success": true,
  "message": "Account verified successfully",
  "token": "jwt_token_here",
  "user": { /* user data */ }
}
```

## ⚙️ Environment Configuration

### Required Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
# Add other environment variables as needed
```

### Backend Configuration
- Ensure API endpoints are accessible
- CORS configured for frontend origin
- Database connection working
- Email service configured (for production OTP)

## 📋 Testing Checklist

### Registration Flow
- [ ] Can register with valid data
- [ ] OTP verification works
- [ ] Account created successfully
- [ ] Validation prevents invalid data
- [ ] Error messages are clear

### Login Flow
- [ ] Can login with valid credentials
- [ ] Invalid credentials show errors
- [ ] Session persists on refresh
- [ ] Logout clears session
- [ ] Protected routes work

### Role-Based Access
- [ ] Job-seekers access job-seeker dashboard
- [ ] Admins access admin dashboard
- [ ] Unauthorized access prevented

## 🎯 Next Steps

1. Run automated tests: `npm test`
2. Check test coverage: `npm test -- --coverage`
3. Monitor browser DevTools during manual testing
4. Test all scenarios in this guide
5. Verify backend API responses match expected formats

## 📞 Support

If you encounter issues during testing:

1. Check browser DevTools for errors
2. Verify backend is running and accessible
3. Check environment variable configuration
4. Review API response formats
5. Test individual scenarios step-by-step

## Summary

This guide covers 7 comprehensive manual testing scenarios for the authentication system. Each scenario includes step-by-step instructions, expected results, and debugging tips. Use this guide alongside automated tests for complete validation of the login/registration flow.