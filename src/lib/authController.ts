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
import { sendOTPEmail } from '@/lib/emailService'

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
    // Skip connectDB for login - just proxy to backend
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

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        // Exists and verified
        return res.json({ redirect: "/login" });
      } else {
        // Exists but not verified - resend OTP if not in cooldown
        if (existingUser.otpExpires && existingUser.otpExpires > new Date(Date.now() - 60000)) {
          return res.status(429).json({ message: "Please wait before requesting another OTP" });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.otp = otp;
        existingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await existingUser.save();

        await sendOTPEmail(email, otp);

        return res.json({ redirect: "/verify-otp", email });
      }
    }

    // New user
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      isVerified: false,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await newUser.save();

    await sendOTPEmail(email, otp);

    // Log registration
    try {
      await logActivity({
        user_id: newUser._id,
        action: 'REGISTER',
        request: req,
        details: { email: newUser.email, name: newUser.name },
      });
    } catch (auditError) {
      console.warn('Failed to log registration:', auditError);
    }

    res.json({ redirect: "/verify-otp", email });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const authVerify = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToBackend(req, res, 'verify')
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
  return proxyToBackend(req, res, 'resend-verification')
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
