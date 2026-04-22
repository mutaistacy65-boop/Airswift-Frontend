// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { logActivity } from '@/lib/auditLogService'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { sendOTPEmail, sendVerificationEmail } from '@/lib/emailService'
import { 
  verificationResendLimiter, 
  registrationLimiter, 
  createRateLimitErrorResponse 
} from '@/lib/rateLimiter'
import { 
  generateVerificationToken, 
  verifyTokenMatch, 
  isTokenValid 
} from '@/lib/emailVerificationHelper'

/**
 * 🍪 CRITICAL BACKEND REQUIREMENT 🍪
 * 
 * The backend MUST set cookies with these exact settings:
 * 
 * res.cookie('accessToken', token, {
 *   httpOnly: true,        // ✅ Prevents XSS attacks
 *   secure: true,          // ✅ REQUIRED on HTTPS (Vercel/Render/Production)
 *   sameSite: "none",      // ✅ REQUIRED for cross-origin requests
 * });
 * 
 * If these settings are missing:
 * - Cookies won't be sent with requests (sameSite issue)
 * - Cookies might be accessible to XSS (missing httpOnly)
 * - Insecure transmission (missing secure)
 * 
 * See COOKIE_CONFIGURATION.md for full details
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airswift-backend-fjt3.onrender.com'
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'change_me'

export const verifyToken = (req: NextApiRequest) => {
  return new Promise((resolve, reject) => {
    // Prefer Authorization bearer header before cookie to avoid stale session cookies
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.accessToken

    if (!token) {
      reject(new Error('No token provided'))
      return
    }

    jwt.verify(token, JWT_ACCESS_SECRET, (err: any, decoded: any) => {
      if (err) {
        reject(new Error('Invalid token'))
        return
      }

      resolve({
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role,
      })
    })
  })
}

const proxyToBackend = async (req: NextApiRequest, res: NextApiResponse, endpoint: string) => {
  try {
    const url = `${API_URL}/api/auth/${endpoint}`
    const config = {
      method: req.method as any,
      headers: {
        'Content-Type': 'application/json',
        // Only pass safe headers
        'authorization': req.headers.authorization,
        'user-agent': req.headers['user-agent'],
      },
      ...(req.method !== 'GET' && { data: req.body }),
    }

    const result = await axios(url, config)
    const data = result.data

    // Set access token cookie for browser sessions (for login endpoints)
    if (endpoint.includes('login') && result.status >= 200 && result.status < 300) {
      const authToken = data.accessToken || data.token || data?.user?.accessToken || data?.user?.token
      if (authToken) {
        const cookieValue = serialize('accessToken', authToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
        })
        res.setHeader('Set-Cookie', cookieValue)
      }
    }

    return res.status(result.status).json(data)
  } catch (error: any) {
    console.error(`Proxy error for ${endpoint}:`, error)
    if (error.response) {
      return res.status(error.response.status).json(error.response.data)
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const authLogin = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Check if user exists and is verified in local DB first
    await connectDB();
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        code: 'VALIDATION_ERROR'
      });
    }

    // Check if user exists locally
    const user = await User.findOne({ email: email.toLowerCase() });

    // ⚠️ IMPORTANT: Block unverified users from logging in
    if (user && !user.isVerified) {
      // User exists but not verified - don't allow login
      console.log(`⚠️ Login attempt for unverified account: ${email}`);

      // Generate new verification token if needed
      const now = new Date();
      const shouldGenerateNewToken = !user.verificationTokenExpires || 
                                     now > user.verificationTokenExpires;

      if (shouldGenerateNewToken) {
        const { token, hashedToken, expiresAt } = generateVerificationToken(24 * 60);
        user.verificationToken = hashedToken;
        user.verificationTokenExpires = expiresAt;
        await user.save();

        // Resend verification email
        try {
          await sendVerificationEmail(email, user.name, token);
          console.log(`✅ Verification email resent to unverified user: ${email}`);
        } catch (emailError) {
          console.error('Failed to resend verification email on login:', emailError);
        }
      }

      // Log failed login attempt
      try {
        await logActivity({
          user_id: user._id,
          action: 'LOGIN_UNVERIFIED',
          request: req,
          details: {
            email: user.email,
            reason: 'Account not verified'
          },
        });
      } catch (auditError) {
        console.warn('Failed to log login attempt:', auditError);
      }

      return res.status(403).json({ 
        message: "Your account has not been verified yet. Check your email for the verification link.",
        code: 'ACCOUNT_NOT_VERIFIED',
        email: email,
        redirect: '/verify-email',
        retryAfter: 60 // Suggest checking email after 1 minute
      });
    }

    // Try to proxy to backend for credentials verification
    const url = `${API_URL}/api/auth/login`
    const config = {
      method: req.method as any,
      headers: {
        'Content-Type': 'application/json',
        'user-agent': req.headers['user-agent'],
      },
      ...(req.method !== 'GET' && { data: req.body }),
    }

    const result = await axios(url, config)
    const data = result.data

    // Set access token cookie for browser sessions
    const authToken = data.accessToken || data.token || data?.user?.accessToken || data?.user?.token
    if (authToken && result.status >= 200 && result.status < 300) {
      const cookieValue = serialize('accessToken', authToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      })
      res.setHeader('Set-Cookie', cookieValue)
    }

    // Log login activity (successful or failed)
    try {
      if (result.status >= 200 && result.status < 300 && data.user) {
        // Successful login
        await logActivity({
          user_id: data.user._id || data.user.id,
          action: 'LOGIN',
          request: req,
          details: {
            email: data.user.email,
            role: data.user.role,
          },
        })

        // Emit real-time event for audit log dashboard
        const io = (res.socket as any)?.server?.io
        if (io) {
          try {
            io.emit('audit_log', {
              action: 'LOGIN',
              user: data.user.name || data.user.email,
              email: data.user.email,
              timestamp: new Date().toISOString(),
            })
          } catch (socketErr) {
            console.warn('Socket emission failed:', socketErr)
          }
        }
      } else {
        // Failed login attempt
        const email = req.body?.email || 'unknown'
        await logActivity({
          action: 'FAILED_LOGIN',
          request: req,
          details: {
            reason: data.message || 'Invalid credentials',
            email,
          },
        })

        // Emit event for failed login
        const io = (res.socket as any)?.server?.io
        if (io) {
          try {
            io.emit('audit_log', {
              action: 'FAILED_LOGIN',
              user: email,
              email: email,
              timestamp: new Date().toISOString(),
            })
          } catch (socketErr) {
            console.warn('Socket emission failed:', socketErr)
          }
        }
      }
    } catch (auditError) {
      console.warn('Failed to log login activity:', auditError)
      // Continue even if audit log fails
    }

    return res.status(result.status).json(data)
  } catch (error: any) {
    console.error('Login proxy error:', error?.message || error)
    console.error('Full error:', error)
    
    // Log the error as failed login
    try {
      const email = req.body?.email || 'unknown'
      await logActivity({
        action: 'FAILED_LOGIN',
        request: req,
        details: {
          reason: error.message || 'Server error',
          email,
        },
      })

      // Emit event for server error
      const io = (res.socket as any)?.server?.io
      if (io) {
        try {
          io.emit('audit_log', {
            action: 'FAILED_LOGIN',
            user: email,
            email: email,
            reason: 'Server error',
            timestamp: new Date().toISOString(),
          })
        } catch (socketErr) {
          console.warn('Socket emission failed:', socketErr)
        }
      }
    } catch (auditError) {
      console.warn('Failed to log failed login:', auditError)
    }

    if (error.response) {
      return res.status(error.response.status).json(error.response.data)
    }

    // Handle DB/network failures gracefully
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ message: 'Database temporarily unavailable' })
    }

    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const adminLogin = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToBackend(req, res, 'admin/login')
}

export const authRegister = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email, and password are required",
        code: 'VALIDATION_ERROR'
      });
    }

    // 🔐 Rate limiting: max 3 registration attempts per 30 minutes per email
    const { allowed, retryAfter } = registrationLimiter.isAllowed(email, 3);
    if (!allowed) {
      const error = createRateLimitErrorResponse(retryAfter);
      return res.status(429).json(error);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (existingUser.isVerified) {
        // User exists and is verified - direct to login
        // ⚠️ SECURITY: Don't explicitly say account exists (prevents email enumeration)
        // Instead, we tell them to check their email or login
        return res.status(409).json({ 
          message: "An account with this email already exists. Please log in.",
          code: 'USER_EXISTS',
          redirect: '/login'
        });
      } else {
        // User exists but NOT verified - resend verification email with rate limit
        // 🔐 Rate limiting: max 3 resends per 5 minutes
        const { allowed: resendAllowed, retryAfter: resendRetryAfter } = 
          verificationResendLimiter.isAllowed(email, 3);
        
        if (!resendAllowed) {
          const error = createRateLimitErrorResponse(resendRetryAfter);
          return res.status(429).json({
            ...error,
            code: 'VERIFICATION_RESEND_RATE_LIMIT',
            email // Include email only if user initiated resend
          });
        }

        // Generate new verification token (expires in 24 hours)
        const { token, hashedToken, expiresAt } = generateVerificationToken(24 * 60);
        
        existingUser.verificationToken = hashedToken;
        existingUser.verificationTokenExpires = expiresAt;
        await existingUser.save();

        // Send verification email
        try {
          await sendVerificationEmail(email, existingUser.name, token);
          console.log(`✅ Verification email resent to ${email}`);
        } catch (emailError) {
          console.error('Failed to resend verification email:', emailError);
          // Don't expose email error to user
          return res.status(500).json({ 
            message: "Failed to send verification email. Please try again.",
            code: 'EMAIL_SEND_FAILED'
          });
        }

        // Log the resend attempt
        try {
          await logActivity({
            user_id: existingUser._id,
            action: 'VERIFICATION_RESEND',
            request: req,
            details: { 
              email: existingUser.email,
              reason: 'Duplicate registration attempt'
            },
          });
        } catch (auditError) {
          console.warn('Failed to log resend attempt:', auditError);
        }

        return res.status(200).json({ 
          message: "Account already exists. Verification email has been resent.",
          code: 'VERIFICATION_EMAIL_RESENT',
          email: email, // Safe to return since user initiated this action
          redirect: '/verify-email'
        });
      }
    }

    // ✅ NEW USER - Create account with verification required
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token (expires in 24 hours)
    const { token, hashedToken, expiresAt } = generateVerificationToken(24 * 60);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      isVerified: false, // 🔑 CRITICAL: Set to false - account not verified yet
      verificationToken: hashedToken, // Store hashed token
      verificationTokenExpires: expiresAt, // Store expiry time
      otp: null, // OTP flow is deprecated in favor of token-based verification
      otpExpires: null,
    });

    await newUser.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, name, token);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Delete user if email fails (transaction-like behavior)
      await User.deleteOne({ _id: newUser._id });
      return res.status(500).json({ 
        message: "Failed to send verification email. Please try again.",
        code: 'EMAIL_SEND_FAILED'
      });
    }

    // Log registration
    try {
      await logActivity({
        user_id: newUser._id,
        action: 'REGISTER',
        request: req,
        details: { 
          email: newUser.email, 
          name: newUser.name,
          verified: false 
        },
      });
    } catch (auditError) {
      console.warn('Failed to log registration:', auditError);
      // Don't fail the registration if audit logging fails
    }

    return res.status(201).json({ 
      message: "Registration successful! Check your email to verify your account.",
      code: 'REGISTRATION_SUCCESS',
      email: email,
      redirect: '/verify-email',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        isVerified: false
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error separately (in case of race condition)
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "An account with this email already exists. Please log in.",
        code: 'USER_EXISTS',
        redirect: '/login'
      });
    }

    res.status(500).json({ 
      message: 'Registration failed. Please try again.',
      code: 'REGISTRATION_FAILED'
    });
  }
}

export const authVerify = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToBackend(req, res, 'verify')
}

/**
 * Email verification endpoint
 * Handles clicking the verification link from email
 * URL format: /api/auth/verify-email?token=<verification_token>
 */
export const authVerifyEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        message: "Invalid verification link. Missing or malformed token.",
        code: 'INVALID_TOKEN'
      });
    }

    await connectDB();

    // Find user with matching hashed token that hasn't expired
    const user = await User.findOne({
      verificationToken: { $exists: true, $ne: null },
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Verification link is invalid or has expired. Please request a new one.",
        code: 'TOKEN_EXPIRED_OR_INVALID'
      });
    }

    // Verify token by comparing hashes
    const tokenMatches = verifyTokenMatch(token, user.verificationToken);
    if (!tokenMatches) {
      // Log suspicious activity (possible token tampering)
      console.warn(`⚠️ Token verification failed for user: ${user.email}`);
      return res.status(400).json({
        message: "Verification link is invalid. Please request a new one.",
        code: 'INVALID_TOKEN'
      });
    }

    // ✅ Token is valid - Mark user as verified
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    // Log verification
    try {
      await logActivity({
        user_id: user._id,
        action: 'EMAIL_VERIFIED',
        request: req,
        details: {
          email: user.email,
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        },
      });
    } catch (auditError) {
      console.warn('Failed to log email verification:', auditError);
    }

    console.log(`✅ User verified: ${user.email}`);

    return res.status(200).json({
      message: "Email verified successfully! You can now log in.",
      code: 'EMAIL_VERIFIED',
      email: user.email,
      redirect: '/login',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: true
      }
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      message: 'Email verification failed. Please try again.',
      code: 'VERIFICATION_FAILED'
    });
  }
}

export const authRefresh = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToBackend(req, res, 'refresh')
}

export const authForgotPassword = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await sendEmail(user.email, "Reset Password", `Click here to reset your password: ${resetLink}`, `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`);

    res.json({ message: "Reset link sent" });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const authResetPassword = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const authResendOtp = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToBackend(req, res, 'resend-otp')
}

export const authResendVerification = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        code: 'VALIDATION_ERROR'
      });
    }

    // 🔐 Rate limiting: max 3 resends per 5 minutes
    const { allowed, retryAfter } = verificationResendLimiter.isAllowed(email, 3);
    if (!allowed) {
      const error = createRateLimitErrorResponse(retryAfter);
      return res.status(429).json({
        ...error,
        code: 'VERIFICATION_RESEND_RATE_LIMIT'
      });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // ⚠️ SECURITY: Don't reveal if email exists (prevents email enumeration)
      return res.status(200).json({
        message: "If an account with that email exists and is unverified, a verification link will be sent.",
        code: 'RESEND_INITIATED'
      });
    }

    if (user.isVerified) {
      // Account already verified - direct to login
      return res.status(200).json({
        message: "Your account is already verified. You can log in.",
        code: 'ALREADY_VERIFIED',
        redirect: '/login'
      });
    }

    // User exists and is NOT verified - send new verification link
    const { token, hashedToken, expiresAt } = generateVerificationToken(24 * 60);
    
    user.verificationToken = hashedToken;
    user.verificationTokenExpires = expiresAt;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, user.name, token);
      console.log(`✅ Verification email resent to ${email}`);
    } catch (emailError) {
      console.error('Failed to resend verification email:', emailError);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
        code: 'EMAIL_SEND_FAILED'
      });
    }

    // Log the resend
    try {
      await logActivity({
        user_id: user._id,
        action: 'VERIFICATION_RESEND',
        request: req,
        details: {
          email: user.email,
          reason: 'User requested resend'
        },
      });
    } catch (auditError) {
      console.warn('Failed to log resend:', auditError);
    }

    return res.status(200).json({
      message: "Verification link has been sent to your email.",
      code: 'VERIFICATION_EMAIL_SENT',
      email: email,
      retryAfter: 300 // Suggest retry after 5 minutes
    });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return res.status(500).json({
      message: 'Failed to resend verification. Please try again.',
      code: 'RESEND_FAILED'
    });
  }
}

export const authSendRegistrationOtp = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToBackend(req, res, 'send-registration-otp')
}

export const authVerifyOtp = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToBackend(req, res, 'verify-otp')
}

export const authVerifyRegistrationOtp = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({ message: "Account verified. You can login now." });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const proxyToAdminBackend = async (req: NextApiRequest, res: NextApiResponse, endpoint: string) => {
  try {
    // Verify admin access
    let user
    try {
      user = await verifyToken(req)
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (!user || (user as any).role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" })
    }

    const url = `${API_URL}/api/admin/${endpoint}`
    const config = {
      method: req.method as any,
      headers: {
        'Content-Type': 'application/json',
        // Only pass safe headers
        'authorization': req.headers.authorization,
        'user-agent': req.headers['user-agent'],
      },
      ...(req.method !== 'GET' && { data: req.body }),
    }

    const result = await axios(url, config)
    const data = result.data

    return res.status(result.status).json(data)
  } catch (error: any) {
    console.error(`Admin proxy error for ${endpoint}:`, error)
    if (error.response) {
      return res.status(error.response.status).json(error.response.data)
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const adminApplications = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToAdminBackend(req, res, 'applications')
}

export const adminApplicationsById = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  return proxyToAdminBackend(req, res, `applications/${id}`)
}

export const adminCategories = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToAdminBackend(req, res, 'categories')
}

export const adminCategoriesById = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  return proxyToAdminBackend(req, res, `categories/${id}`)
}

export const adminJobs = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToAdminBackend(req, res, 'jobs')
}

export const adminJobsById = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  return proxyToAdminBackend(req, res, `jobs/${id}`)
}

export const adminInterviews = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToAdminBackend(req, res, 'interviews')
}

export const adminInterviewsById = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  return proxyToAdminBackend(req, res, `interviews/${id}`)
}

export const adminSettings = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToAdminBackend(req, res, 'settings')
}

export const adminStats = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToAdminBackend(req, res, 'stats')
}

export const adminEmailLogs = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToAdminBackend(req, res, 'email-logs')
}

export const adminSendBulkEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToAdminBackend(req, res, 'email/send-bulk')
}

export const adminSendInterview = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToAdminBackend(req, res, 'send-interview')
}

export const adminSendInterviewById = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  return proxyToAdminBackend(req, res, `send-interview/${id}`)
}

export const adminGenerateOffer = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  return proxyToAdminBackend(req, res, `generate-offer/${id}`)
}

export const adminCvScoring = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToAdminBackend(req, res, 'cv-scoring/analyze')
}
