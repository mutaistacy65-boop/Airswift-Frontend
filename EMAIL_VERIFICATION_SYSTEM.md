# Email Verification System Documentation

## Overview

This document outlines the complete email verification implementation for the Airswift platform. The system ensures secure user registration with email verification before allowing login access.

## ✅ Features Implemented

### 1. **User Registration with Email Verification**
- New users must verify their email before accessing the platform
- Secure token-based verification (not simple OTP)
- 24-hour token expiration
- Rate limiting to prevent abuse

### 2. **Duplicate Registration Handling**
- When registering with an existing unverified email, the user is informed
- A new verification link is sent instead of creating a duplicate account
- Rate limiting prevents email spam (max 3 requests per 5 minutes)

### 3. **Login Protection**
- Unverified users cannot log in
- Helpful error message with option to resend verification
- Optional automatic resend of verification link

### 4. **Rate Limiting**
- Registration: Max 3 attempts per 30 minutes per email
- Verification resend: Max 3 attempts per 5 minutes per email
- OTP verification: Max 5 attempts per 10 minutes per email
- Login attempts: Max 5 attempts per 15 minutes per user

### 5. **Security Best Practices**
- Tokens are hashed before storage (SHA256)
- Raw tokens are sent in emails (not hashed tokens)
- Constant-time comparison to prevent timing attacks
- No email enumeration (errors don't reveal if email exists)
- Single-use tokens that are invalidated after verification
- Import logging and audit trails

---

## 🔄 User Flows

### Flow 1: New User Registration

```
1. User fills registration form
2. User clicks "Create Account"
   ↓
3. Backend checks if email exists
   - If exists and verified → Error: Account exists
   - If exists and unverified → Send new verification link
   - If not exists → Continue
   ↓
4. User created with:
   - isVerified = false
   - verificationToken (hashed)
   - verificationTokenExpires (24 hours from now)
   ↓
5. Verification email sent with link:
   https://airswift.com/verify-email?token=<RAW_TOKEN>
   ↓
6. User shown success screen:
   - "Check your email"
   - Option to resend verification
   - Link to login page
```

### Flow 2: User Clicks Verification Link

```
1. User receives email and clicks verification link
2. Browser navigates to: /verify-email?token=<RAW_TOKEN>
3. Frontend page calls: GET /api/auth/verify-email?token=<RAW_TOKEN>
   ↓
4. Backend:
   - Finds user by matching hashed token
   - Checks token expiry
   - Compares hashes using constant-time comparison
   ↓
5. If valid:
   - Sets user.isVerified = true
   - Clears verificationToken and verificationTokenExpires
   - Returns success message
   ↓
6. If invalid/expired:
   - Returns error
   - Shows resend form on frontend
```

### Flow 3: Unverified Account Login Attempt

```
1. User tries to log in with email/password
   ↓
2. Backend checks in authLogin:
   - Finds user in database
   - Checks if isVerified = false
   ↓
3. If not verified:
   - Blocks access
   - Generates new verification token (if old one expired)
   - Sends verification email
   - Returns: 403 ACCOUNT_NOT_VERIFIED
   - Message: "Check your email to verify"
   ↓
4. Frontend:
   - Shows error message
   - Prompts user to check email
   - Offers to resend verification link
   - Links to /verify-email page
```

### Flow 4: Resend Verification Email

```
1. User navigates to /verify-email
2. Fills in email and clicks "Resend Verification Email"
   ↓
3. Frontend calls: POST /api/auth/resend-verification
   with body: { email: "user@example.com" }
   ↓
4. Backend rate limiting check:
   - Max 3 resends per 5 minutes
   - Returns 429 if exceeded
   ↓
5. If allowed:
   - Finds user by email
   - If doesn't exist → Returns "Email sent" (no enumeration)
   - If exists and verified → "Already verified"
   - If exists and unverified → Generate new token → Send email
   ↓
6. Frontend shows success message
```

---

## 🛠️ Technical Implementation

### Database Schema

```typescript
interface IUser {
  email: string
  isVerified: boolean              // 🔑 Primary verification flag
  verificationToken?: string       // Hashed token from SHA256
  verificationTokenExpires?: Date  // Expiry time
  // ... other fields
}
```

### API Endpoints

#### 1. **POST /api/auth/register**
Register a new user with email verification

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "user"
}
```

**Success Response (201):**
```json
{
  "code": "REGISTRATION_SUCCESS",
  "message": "Registration successful! Check your email to verify your account.",
  "email": "john@example.com",
  "redirect": "/verify-email",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "isVerified": false
  }
}
```

**Error Response (409):**
```json
{
  "code": "USER_EXISTS",
  "message": "An account with this email already exists. Please log in.",
  "redirect": "/login"
}
```

**Error Response (429):**
```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again in 30 minutes.",
  "retryAfter": 1800
}
```

#### 2. **GET /api/auth/verify-email?token=<TOKEN>**
Verify email with token from email link

**Success Response (200):**
```json
{
  "code": "EMAIL_VERIFIED",
  "message": "Email verified successfully! You can now log in.",
  "redirect": "/login",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "isVerified": true
  }
}
```

**Error Response (400):**
```json
{
  "code": "TOKEN_EXPIRED_OR_INVALID",
  "message": "Verification link is invalid or has expired. Please request a new one."
}
```

#### 3. **POST /api/auth/resend-verification**
Resend verification email

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "code": "VERIFICATION_EMAIL_SENT",
  "message": "Verification link has been sent to your email.",
  "email": "john@example.com",
  "retryAfter": 300
}
```

**Error Response (429):**
```json
{
  "code": "VERIFICATION_RESEND_RATE_LIMIT",
  "message": "Too many requests. Please try again in 5 minutes.",
  "retryAfter": 300
}
```

#### 4. **POST /api/auth/login**
Login with email verification check

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Error Response (403) - Unverified Account:**
```json
{
  "code": "ACCOUNT_NOT_VERIFIED",
  "message": "Your account has not been verified yet. Check your email for the verification link.",
  "email": "john@example.com",
  "redirect": "/verify-email",
  "retryAfter": 60
}
```

---

## 🔐 Security Features

### Token Generation & Verification

```typescript
// Token generation (emailVerificationHelper.ts)
export function generateVerificationToken(expiryMinutes = 10) {
  // Generate random 32-byte token
  const token = crypto.randomBytes(32).toString('hex')
  
  // Hash token for storage
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
  
  // Set expiry
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)
  
  return { token, hashedToken, expiresAt }
}

// Token verification (timing-safe comparison)
export function verifyTokenMatch(providedToken: string, hashedTokenInDB: string): boolean {
  const hashedToken = crypto
    .createHash('sha256')
    .update(providedToken)
    .digest('hex')
  
  // Prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(hashedToken),
    Buffer.from(hashedTokenInDB)
  )
}
```

### Rate Limiting

```typescript
// rateLimiter.ts
export const verificationResendLimiter = new RateLimiter(5 * 60 * 1000) // 5 minutes

// Usage in authResendVerification
const { allowed, retryAfter } = verificationResendLimiter.isAllowed(email, 3)
if (!allowed) {
  return res.status(429).json(createRateLimitErrorResponse(retryAfter))
}
```

### No Email Enumeration

```typescript
// Good: Doesn't reveal if email exists
if (!user) {
  return res.status(200).json({
    message: "If an account exists, a verification link will be sent."
  })
}

// Bad: Reveals email existence
if (!user) {
  return res.status(404).json({
    message: "Email not found"  // ❌ Allows enumeration
  })
}
```

---

## 📧 Email Template

The verification email includes:

1. **Branded Header** - Airswift branding
2. **Clear Instructions** - What user should do
3. **CTA Button** - Large, obvious verification link button
4. **Backup Link** - Plain text link for email clients that don't render
5. **Expiry Information** - "Link expires in 24 hours"
6. **Security Note** - Token is single-use
7. **Support Information** - Contact support link

---

## 🚀 Frontend Pages

### 1. **Register Page** (`/register`)
- Shows registration form
- On success → Shows "Check your email" screen
- Offers resend verification option

### 2. **Verify Email Page** (`/verify-email`)
- Accepts query param: `?token=<verification_token>`
- Auto-verifies if token present
- Shows resend form if no token or verification fails
- Redirects to login on success

### 3. **Login Page** (`/login`)
- Blocks unverified users with clear error
- Offers to resend verification link
- Redirects to `/verify-email` if user confirms

---

## 🔧 Configuration

### Environment Variables

```bash
# Email Configuration
FRONTEND_URL=http://localhost:3000
EMAIL_FROM=noreply@airswift.com

# Email Service (choose one)
BREVO_API_KEY=your_brevo_key
BREVO_SMTP_USER=your_smtp_user

# OR

SENDGRID_API_KEY=your_sendgrid_key

# OR

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_SECURE=false
```

### Token Expiry Times

```typescript
// Current configuration
const tokenExpiryMinutes = 24 * 60 // 24 hours

// Can be adjusted in generateVerificationToken()
```

---

## 📊 Audit Logging

All verification events are logged:

```typescript
// Registration
await logActivity({
  user_id: newUser._id,
  action: 'REGISTER',
  details: { email, name, verified: false }
})

// Verification success
await logActivity({
  user_id: user._id,
  action: 'EMAIL_VERIFIED',
  details: { email, ipAddress }
})

// Failed login attempt (unverified)
await logActivity({
  user_id: user._id,
  action: 'LOGIN_UNVERIFIED',
  details: { email, reason: 'Account not verified' }
})

// Resend verification
await logActivity({
  user_id: user._id,
  action: 'VERIFICATION_RESEND',
  details: { email, reason: 'User requested resend' }
})
```

---

## 🧪 Testing

### Test Case 1: New User Registration
```
1. Register with new email
2. Verify email appears in inbox
3. Click verification link
4. Verify redirected to login
5. Try to login → Success
```

### Test Case 2: Duplicate Unverified Registration
```
1. Register with email A (don't verify)
2. Try to register again with email A
3. Verify error message appears
4. Verify new verification email sent
```

### Test Case 3: Login Before Verification
```
1. Register with email B
2. Try to login with email B
3. Verify blocked with "verify email" message
4. Click "resend" → new email sent
5. Verify email and login → Success
```

### Test Case 4: Rate Limiting
```
1. Register and don't verify
2. Click resend verification 4 times rapidly
3. 4th attempt should return 429 error
4. Wait 5 minutes → Can resend again
```

### Test Case 5: Token Expiry
```
1. Register and receive verification link
2. Wait 24 hours
3. Click verification link
4. Should show expired token error
5. Use resend form to get new link
```

---

## 🐛 Troubleshooting

### Email Not Sending
- Check email service configuration (Brevo/SendGrid/SMTP)
- Verify API keys in environment variables
- Check email logs in database
- Test email service with test account

### Users Can't Verify
- Ensure `FRONTEND_URL` is set correctly
- Check token format in email link
- Verify database has verification fields
- Check token hasn't expired

### Rate Limiting Issues
- Clear rate limiter cache if needed: `limiter.reset(email)`
- Adjust limits in `rateLimiter.ts` if too strict
- Note: Limiter is in-memory (resets on server restart)

---

## 📝 Files Modified/Created

### Created Files
- `/src/lib/rateLimiter.ts` - Rate limiting utility
- `/src/pages/api/auth/verify-email.ts` - Email verification endpoint
- `/src/pages/verify-email.tsx` - Frontend verification page

### Modified Files
- `/src/lib/authController.ts` - Enhanced register, login, and verification logic
- `/src/pages/api/auth/resend-verification.ts` - Updated resend endpoint
- `/src/lib/emailService.ts` - Improved verification email template
- `/src/pages/register.tsx` - Updated with new verification flow
- `/src/pages/login.tsx` - Added unverified account handling
- `/src/lib/models/User.ts` - Already had correct schema

---

## 🔄 Migration Guide

If migrating from OTP-based verification:

1. Keep both `otp` and `verificationToken` fields during transition
2. New registrations use `verificationToken`
3. Existing OTP-verified users continue as-is
4. After transition period, remove OTP fields

---

## 📞 Support

For issues or questions about the verification system:

1. Check audit logs in admin dashboard
2. Review email logs
3. Check rate limiter status
4. Contact support team

---

## 📚 Related Documentation

- [Authentication Flow](./AUTH_FLOW.md)
- [API Reference](./API_REFERENCE.md)
- [Security Best Practices](./SECURITY.md)
- [Email Configuration](./EMAIL_CONFIG.md)

---

**Last Updated:** April 2024  
**Version:** 1.0  
**Status:** ✅ Production Ready
