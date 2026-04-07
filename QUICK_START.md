# Quick Start - Email Verification Setup (5 Minutes)

## Step 1: Install Dependencies (30 seconds)
```bash
npm install nodemailer @types/nodemailer
```

## Step 2: Configure Environment (.env.local)
```bash
# Copy this into your .env.local file and update values

# Database
MONGODB_URI=your_mongodb_connection_string_here

# Security
JWT_SECRET=your_super_secret_key_change_in_production_12345
NODE_ENV=development

# URLs
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Email (Pick ONE option below)

# OPTION A: Testing (No config needed - auto emails to console)
# Leave these commented out - will use Ethereal Email

# OPTION B: Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password_not_regular_password
EMAIL_FROM=noreply@yourcompany.com

# OPTION C: SendGrid
# SENDGRID_API_KEY=SG.your_sendgrid_key_here
# EMAIL_FROM=noreply@yourcompany.com
```

**Note:** See `.env.example` for detailed explanations.

## Step 3: Test Email Setup (2 minutes)

### For Testing (Easiest)
1. Leave SMTP/SendGrid commented out
2. Run: `npm run dev`
3. Check terminal for Ethereal test account
4. Register a user → Email preview shows in console

### For Gmail (Recommended for Development)
1. Enable 2FA on Gmail
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create app password
4. Paste into `SMTP_PASS` above
5. Run: `npm run dev`
6. Register a user → Email arrives in inbox

### For SendGrid (Production)
1. Sign up at [SendGrid](https://sendgrid.com)
2. Get API key from Settings → API Keys
3. Verify sender email address
4. Add to `.env.local`
5. Deploy to production

## Step 4: Test Registration Flow (1 minute)

### Using API/cURL
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Registration successful! Check your email to verify your account.",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "isVerified": false
  }
}
```

### Using Frontend (Optional)
Build a registration form that calls `AuthService.register()`
See `/src/services/authService.ts` for usage.

## Step 5: Test Verification Flow (1 minute)

### 1. Get Verification Token
- Check email (or console in test mode)
- Find token in link: `...verify?token=**abc123...**`
- Copy the entire token string

### 2. Visit Verification Link
- Click link in email, OR
- Visit manually: `http://localhost:3000/verify?token=abc123...`
- Page shows: Loading → Success → Auto-redirects to login

### 3. Verify in Database
```bash
# Check MongoDB
db.users.findOne({email: "test@example.com"})

# Should show:
# {
#   isVerified: true,
#   verificationToken: null,
#   verificationTokenExpires: null
# }
```

## Step 6: Test Expired Token (30 seconds)

### 1. Wait or Modify Code
- Default expiry: 10 minutes
- To test immediately, edit `/src/lib/emailVerificationHelper.ts`:
  ```typescript
  // Change from: generateVerificationToken(10)
  // To: generateVerificationToken(-1) // Expires immediately
  ```

### 2. Try Verification with Old Token
- Visit `/verify?token=expired_token`
- Should show: "Verification token has expired"

### 3. Resend Email
- Click "Resend Verification Email"
- Enter email address
- Get new verification link
- Click new link → Success!

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "MongoDB connection error" | Check MONGODB_URI is correct and MongoDB is running |
| "Email not sent" | Check SMTP/SendGrid config, try test mode first |
| "Email to console" (in test mode) | Normal behavior, check server terminal output |
| "Link doesn't work" | Verify FRONTEND_URL and NEXT_PUBLIC_API_URL are set |
| "Token is undefined" | Ensure generateVerificationToken() is called in register endpoint |
| "Email field required" | Check registration form sends all fields |

## What's Included

✅ **Secure Token Generation**
- 32-byte random tokens
- SHA256 hashing before storage
- 10-minute expiration
- Constant-time comparison

✅ **Email Sending**
- Multiple provider support (SMTP, SendGrid, Ethereal)
- HTML + text email templates
- Automatic retry logic

✅ **Frontend Verification**
- Auto token extraction from URL
- Loading/success/error states
- "Resend Email" button for expired tokens
- Auto-redirect on success

✅ **Backend Endpoints**
- `/api/auth/register` - Create user with token
- `/api/auth/verify` - Verify token and mark user
- `/api/auth/resend-verification` - Resend verification email

## Production Deployment

### Before Going Live
- [ ] Set JWT_SECRET to random 32+ character string
- [ ] Set FRONTEND_URL to your actual domain
- [ ] Set NEXT_PUBLIC_API_URL to your backend URL
- [ ] Switch to SendGrid or production SMTP
- [ ] Test end-to-end in staging
- [ ] Set NODE_ENV=production
- [ ] Review security checklist in BACKEND_IMPLEMENTATION.md

### Vercel Deployment
1. Push code to GitHub
2. Deploy to Vercel
3. Add environment variables in Vercel dashboard
4. Test registration flow

### Render/Self-Hosted
1. Create MongoDB instance (MongoDB Atlas)
2. Set environment variables
3. Deploy application
4. Test registration flow

## Files Modified
- `/src/lib/models/User.ts` - User schema with email verification
- `/src/lib/emailService.ts` - Email sending
- `/src/pages/api/auth/register.ts` - Registration with token
- `/src/pages/api/auth/verify.ts` - Token verification
- `/src/pages/api/auth/resend-verification.ts` - Resend email
- `/src/pages/verify.tsx` - Frontend verification page
- `/src/lib/authController.ts` - Updated auth logic
- `/package.json` - Added nodemailer

## Next Steps

1. ✅ Set `.env.local` variables
2. ✅ Run `npm install nodemailer @types/nodemailer`
3. ✅ Start dev server: `npm run dev`
4. ✅ Test registration + email
5. ✅ Test verification link
6. ✅ Deploy to production

## Questions?

Check these files for detailed info:
- **Environment Setup:** `.env.example`
- **Full Implementation:** `BACKEND_IMPLEMENTATION.md`
- **Security Details:** `EMAIL_VERIFICATION_GUIDE.md`

## Example Registration Form (React)

```typescript
import { useState } from 'react'
import AuthService from '@/services/authService'

export default function RegisterForm() {
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    setLoading(true)
    try {
      await AuthService.register(
        formData.get('name') as string,
        formData.get('email') as string,
        formData.get('password') as string
      )
      alert('Check your email to verify!')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <input name="name" placeholder="Full Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}
```

Good luck! 🚀
