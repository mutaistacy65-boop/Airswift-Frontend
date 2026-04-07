# Email Verification Implementation - Complete Backend Setup

## Overview
This document details the complete backend email verification implementation with secure token handling, expiry, and user verification.

## Components Implemented

### 1. User Model (`/src/lib/models/User.ts`)
Mongoose schema with email verification fields:
- `verificationToken` - SHA256 hashed token (never raw)
- `verificationTokenExpires` - Token expiration date (10 minutes)
- `isVerified` - Boolean flag for verified status
- Standard fields: name, email, password, phone, role, timestamps

### 2. Token Generation (`/src/lib/emailVerificationHelper.ts`)
**Security functions:**
- `generateVerificationToken()` - Creates raw + hashed token pair with expiry
- `verifyTokenMatch()` - Safe comparison using `crypto.timingSafeEqual()`
- `isTokenValid()` - Checks if token hasn't expired

**Key Security:**
```typescript
// Generated token pair:
{
  token: "raw_token_abc123...",        // Sent in email
  hashedToken: "sha256_hash...",       // Stored in database
  expiresAt: Date                      // 10 minutes from now
}
```

### 3. Email Service (`/src/lib/emailService.ts`)
**Supports 3 email delivery methods:**
1. **SendGrid** (Production recommended)
   - Requires: `SENDGRID_API_KEY`
   - Best for scale and deliverability

2. **SMTP** (Gmail, Office365, custom)
   - Requires: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - Works with any SMTP provider

3. **Ethereal Email** (Development/Testing)
   - No configuration needed
   - Automatic test account creation
   - URL preview in console

**Functions:**
- `sendVerificationEmail()` - Sends verification link with HTML/text
- `sendWelcomeEmail()` - Sends success email after verification

### 4. Registration Endpoint (`/src/pages/api/auth/register.ts`)
Creates new user with verification token:

**Process:**
1. Validates input (name, email, password, format)
2. Checks if email already exists
3. Hashes password with bcryptjs
4. Generates verification token (10 min expiry)
5. Creates user in MongoDB
6. Sends verification email (non-blocking)
7. Returns user data without password

**Request:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // optional, defaults to "user"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful! Check your email to verify your account.",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user",
    "isVerified": false
  }
}
```

### 5. Verification Endpoint (`/src/pages/api/auth/verify.ts`)
Validates token and marks user as verified:

**Process:**
1. Extracts token from URL query: `/api/auth/verify?token=abc123`
2. Hashes token using SHA256
3. Finds user with matching hashed token
4. Validates token hasn't expired
5. Marks user as verified
6. Clears verification token fields
7. Sends welcome email

**Security:**
- Hashes incoming token before database lookup
- Checks expiration time
- Cleans up expired tokens
- Uses constant-time comparison

**Request:**
```
GET /api/auth/verify?token=abc123def456...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now login to your account.",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "isVerified": true
  }
}
```

**Error (400):**
```json
{
  "message": "Invalid or expired verification token"
}
```

### 6. Resend Verification (`/src/pages/api/auth/resend-verification.ts`)
Allows users to request a new verification email:

**Process:**
1. Finds user by email
2. For security, always returns success (doesn't reveal if email exists)
3. If already verified, tells user to login
4. Generates new token
5. Sends new verification email

**Request:**
```json
POST /api/auth/resend-verification
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Verification email has been sent! Check your inbox."
}
```

## Database Schema

```typescript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, bcrypt hashed),
  phone: String (optional),
  role: Enum ['user', 'admin', 'job-seeker', 'employer'] (default: 'user'),
  isVerified: Boolean (default: false),
  verificationToken: String (null after verification),
  verificationTokenExpires: Date (null after verification),
  createdAt: Date,
  updatedAt: Date
}
```

## Complete Flow

```
1. USER REGISTRATION
   ├─ User submits: name, email, password
   ├─ Backend: Hash password + Generate token
   ├─ Database: Save user with hashed token (10 min expiry)
   └─ Email: Send verification link with RAW token
   
2. EMAIL LINK
   ├─ Email contains: https://airswift.com/verify?token=raw_token_abc123
   └─ User clicks link
   
3. FRONTEND VERIFICATION PAGE
   ├─ Extracts token from URL
   ├─ Calls backend: /api/auth/verify?token=raw_token_abc123
   └─ Shows: loading → success → auto redirect to login
   
4. BACKEND VERIFICATION
   ├─ Hash raw token: SHA256(raw_token)
   ├─ Find user where: verificationToken == hashedToken + NOT expired
   ├─ Update user: isVerified = true, clear tokens
   ├─ Send welcome email
   └─ Return success
   
5. TOKEN EXPIRED SCENARIO
   ├─ User clicks old link (> 10 minutes)
   ├─ Backend: Token found but expired
   ├─ Frontend: Shows "Link expired" + "Resend Email" form
   ├─ User enters email
   ├─ Backend: Generates new token + sends new email
   └─ User clicks new link → Verification success
```

## Token Security Explained

### Why Hash Tokens?
- **Database breach**: If DB is compromised, hashed tokens are useless
- **Logging**: Hashed tokens safe to log without exposing
- **Comparison**: Use `crypto.timingSafeEqual()` to prevent timing attacks

### Token Flow
```
Registration:
  rawToken = crypto.randomBytes(32).toString('hex')       // "abc123..."
  hashedToken = SHA256(rawToken)                          // "def456..."
  DB stores: { verificationToken: "def456..." }
  Email sends: /verify?token=abc123

Verification:
  User visits: /verify?token=abc123
  Frontend extracts token and calls: /api/auth/verify?token=abc123
  Backend hashes: SHA256(abc123) = "def456..."
  Compare: hashedToken from DB == "def456..."
  Match!  ✓ User verified
```

## Environment Variables Required

### Critical for Email Verification
```
FRONTEND_URL=https://yourdomain.com  # For verification links
NEXT_PUBLIC_API_URL=https://yourdomain.com  # Frontend knows backend URL
MONGODB_URI=mongodb+srv://...        # Database
JWT_SECRET=your_secret_key_32_chars  # Session tokens
```

### Choose One Email Provider
```
# Option 1: SendGrid (Production)
SENDGRID_API_KEY=SG.xxxxx...
EMAIL_FROM=noreply@yourdomain.com

# Option 2: SMTP (Gmail, Office365, etc)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password-not-regular-password
EMAIL_FROM=noreply@yourdomain.com

# Option 3: Testing (No config needed, uses Ethereal)
# Leave empty - will auto-configure for testing
```

See `.env.example` for complete setup instructions.

## Frontend Integration

### 1. Registration (Updated)
```typescript
import AuthService from '@/services/authService'

const registerUser = async () => {
  try {
    const result = await AuthService.register(
      'John Doe',
      'john@example.com',
      'password123',
      'user'
    )
    alert('Registration successful! Check your email.')
    // Redirect to verify page or login
  } catch (error) {
    alert(error.message)
  }
}
```

### 2. Verification (Automatic)
- User clicks email link: `https://yoursite.com/verify?token=abc123`
- Page loads at `/pages/verify.tsx`
- Automatically calls: `/api/auth/verify?token=abc123`
- Shows loading → success → redirects to login

### 3. Resend Email
```typescript
import AuthService from '@/services/authService'

const resendEmail = async (email: string) => {
  try {
    const result = await AuthService.resendVerificationEmail(email)
    alert(result.message)
  } catch (error) {
    alert(error.message)
  }
}
```

## Testing Checklist

### Unit Tests (Optional - Can add with Jest)
- [ ] Token generation creates raw + hashed pair
- [ ] Token comparison works correctly
- [ ] Expired tokens are rejected
- [ ] User registration saves hashed token
- [ ] Verification clears token after success

### Integration Tests
- [ ] Full registration flow works
- [ ] Email is sent with correct link
- [ ] Verification link works
- [ ] Expired token shows error
- [ ] Resend email generates new token
- [ ] Already verified user can login

### Manual Testing
1. **Register new user**
   - POST to `/api/auth/register` with valid data
   - Check DB: hashed token saved
   - Check email: verification link received

2. **Verify token immediately**
   - Click verification link in email
   - Page shows success
   - Database: isVerified = true, tokens cleared
   - Can now login

3. **Test expired token**
   - Wait 10+ minutes
   - Click old verification link
   - Page shows "Link expired"
   - Click "Resend Email"
   - Enter email, get new link
   - Click new link, verify succeeds

4. **Test invalid token**
   - Visit `/verify?token=invalid123`
   - Page shows error

5. **Test duplicate email**
   - Register same email twice
   - Second registration returns 409 error

## Migration from Old System

If you had OTP-based verification before:

1. **Keep existing users**: Don't need to modify
2. **New users**: Use email verification token system
3. **Optional**: Add migration script to convert existing users
4. **Gradual rollout**: Old system works, new users get new system

## Deployment Notes

### Vercel
- Set environment variables in Vercel dashboard
- MongoDB Atlas: Whitelist Vercel IPs
- SendGrid: API key accessible from Node.js (not browser)

### Render
- Environment variables in Render dashboard
- Build command: `npm run build`
- Start command: `npm run start` (or use default)

### Docker
```dockerfile
ENV FRONTEND_URL=https://yourdomain.com
ENV MONGODB_URI=your_mongo_url
ENV SENDGRID_API_KEY=your_sendgrid_key
# ... etc
```

## Files Created/Modified

**Created:**
- `/src/lib/models/User.ts` - Mongoose User schema
- `/src/lib/emailService.ts` - Email sending service
- `/src/lib/emailVerificationHelper.ts` - Token utilities (updated)
- `/src/pages/api/auth/register.ts` - Registration endpoint
- `/src/pages/api/auth/resend-verification.ts` - Resend email endpoint
- `.env.example` - Configuration template

**Modified:**
- `/src/pages/api/auth/verify.ts` - Updated to use User model
- `/src/lib/authController.ts` - Updated to use User model
- `/src/pages/verify.tsx` - Added Resend Email feature
- `/src/services/authService.ts` - Added register & resend methods
- `/package.json` - Added nodemailer dependency

## Next Steps

1. ✅ Install dependencies: `npm install nodemailer`
2. ✅ Set environment variables (see `.env.example`)
3. ✅ Test registration endpoint
4. ✅ Test email delivery
5. ✅ Test verification link
6. ✅ Test expired token + resend
7. ✅ Deploy to production
8. ✅ Monitor email delivery & failures

## Support & Debugging

Check logs in order:
1. Frontend console (browser dev tools)
2. Backend terminal output
3. SendGrid dashboard (email delivery status)
4. MongoDB compass (verify token saved correctly)
5. Email provider logs (Gmail, etc)

## Security Reminders

- ✅ Never log raw tokens (only hashed versions)
- ✅ Always use HTTPS in production
- ✅ Store JWT_SECRET securely (env variable)
- ✅ Verify sender email in SendGrid
- ✅ Use app passwords (not regular) for Gmail
- ✅ Set appropriate token expiry (10 min default)
- ✅ Clean up expired tokens periodically
- ✅ Rate limit verification attempts (optional future)
