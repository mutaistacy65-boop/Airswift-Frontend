# Email Monitoring & Logging System

## Overview

This system provides comprehensive monitoring and logging for email operations across the Airswift application. It tracks email sends, failures, and provides insights for debugging email delivery issues.

## Architecture

### 1. Non-Blocking Email Pattern

All email operations now follow this pattern:

```typescript
try {
  await sendEmail(user.email, "Subject", "Body");
  console.log("📧 Email sent successfully");
} catch (err) {
  console.error("❌ Email failed but operation continues", err.message);
}
```

**Key Benefit:** Email failures don't block critical operations like login, registration, or password reset.

### 2. Email Logger Service (`src/lib/emailLogger.ts`)

Provides monitoring capabilities:

```typescript
import { emailLogger } from '@/lib/emailLogger'

// Log successful sends
emailLogger.logSent(recipient, subject, messageId)

// Log failures
emailLogger.logFailed(recipient, subject, error, retries)

// Get statistics
const stats = emailLogger.getStats()

// View recent failures
const failures = emailLogger.getRecentFailures(10)

// Get failures for specific recipient
const recipientFailures = emailLogger.getFailuresForRecipient('user@example.com')
```

### 3. Email Service Integration (`src/lib/emailService.ts`)

The main email service now logs all operations:

```typescript
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const result = await transporter.sendMail(mailOptions)
    emailLogger.logSent(to, subject, result.messageId) // ✅ Log success
    return result
  } catch (error) {
    emailLogger.logFailed(to, subject, error) // ❌ Log failure
    throw error
  }
}
```

### 4. Admin Email Logs API (`src/pages/api/admin/email-logs.ts`)

Endpoint to view email logs and statistics:

```bash
# Get overall statistics
GET /api/admin/email-logs?type=stats

# Get recent failures
GET /api/admin/email-logs?type=recent-failures&limit=20

# Get failures for specific recipient
GET /api/admin/email-logs?type=recipient&recipient=user@example.com

# Export all logs
GET /api/admin/email-logs?type=export
```

**Response Example:**
```json
{
  "total": 150,
  "sent": 145,
  "failed": 5,
  "successRate": "96.67%",
  "lastLog": {
    "id": "1717846234123-abc123def",
    "timestamp": "2024-04-07T10:30:34.123Z",
    "recipient": "user@example.com",
    "subject": "Welcome to Airswift",
    "status": "sent",
    "messageId": "12345@sendgrid.net"
  }
}
```

## Fixed Routes

### 1. Login (`/api/auth/login`)
- ✅ Now sends login alert email non-blocking
- ✅ Login succeeds even if email fails
- ✅ Failures logged for monitoring

### 2. Register (`/api/auth/register`)
- ✅ Verification email is non-blocking
- ✅ Account created even if email fails
- ✅ User can request resend verification

### 3. Email Verification (`/api/auth/verify`)
- ✅ Welcome email is non-blocking
- ✅ Email verification succeeds even if welcome email fails

### 4. Forgot Password (`/api/auth/forgot-password`)
- ✅ Reset email is non-blocking
- ✅ Token is saved even if email fails
- ✅ User can always request a new link

### 5. Resend Verification (`/api/auth/resend-verification`)
- ✅ Resend is non-blocking
- ✅ Token is regenerated even if email fails

## Monitoring Dashboard (Future)

Consider adding an admin dashboard that:

1. **Shows Real-time Stats**
   - Total emails sent/failed
   - Success rate
   - Recent failures

2. **Alerts on Issues**
   - Multiple failures for same recipient
   - SMTP connection errors
   - Rate limiting

3. **Manual Retries**
   - Resend failed emails
   - Bulk resends

## Integration with External Monitoring

For production, integrate with:

- **Sentry**: Send critical email failures to Sentry
- **LogRocket**: Track user impact of email issues
- **SendGrid Webhooks**: Track bounces and complaints
- **PagerDuty**: Alert on-call team for critical issues

```typescript
// Example: Send to Sentry
if (error.message.includes('SMTP')) {
  Sentry.captureException(error, {
    tags: { service: 'email', recipient }
  });
}
```

## Best Practices

### ✅ DO:
- Wrap email in try-catch
- Log all email operations
- Use non-blocking pattern
- Return user-friendly messages
- Route to resend/recovery pages

### ❌ DON'T:
- Expose detailed email errors to users
- Block critical operations on email failure
- Silently fail without logging
- Retry indefinitely
- Send duplicate emails

## Debugging

### Check logs for a specific user:
```bash
curl "http://localhost:3000/api/admin/email-logs?type=recipient&recipient=user@example.com" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View recent failures:
```bash
curl "http://localhost:3000/api/admin/email-logs?type=recent-failures&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Export all logs:
```bash
curl "http://localhost:3000/api/admin/email-logs?type=export" \
  -H "Authorization: Bearer YOUR_TOKEN" > email-logs.json
```

## Environment Variables

Required/Optional email configuration:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false

# OR SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# Email Configuration
EMAIL_FROM=noreply@airswift.com
FRONTEND_URL=https://your-domain.com
```

## Testing Email Failures

To test email failure scenarios:

```typescript
// Temporarily disable email
process.env.SMTP_HOST = ''
process.env.SENDGRID_API_KEY = ''

// Run your tests - email will fail but operations continue
npm test
```

## Monitoring Checklist

- [ ] Set up admin dashboard for email monitoring
- [ ] Configure external alerting (Sentry/PagerDuty)
- [ ] Set up email retry queue for failed emails
- [ ] Define SLAs for email delivery (e.g., 99% delivery within 5 min)
- [ ] Create runbook for email outages
- [ ] Regular audit of email logs (weekly/monthly)
- [ ] Capacity planning for email volume
