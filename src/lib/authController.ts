import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { logActivity } from '@/lib/auditLogService'
import { connectDB } from '@/lib/mongodb'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'change_me'

export const verifyToken = (req: NextApiRequest) => {
  return new Promise((resolve, reject) => {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')

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
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Only pass safe headers
        'authorization': req.headers.authorization,
        'user-agent': req.headers['user-agent'],
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(response.status).json(data)
  } catch (error: any) {
    console.error(`Proxy error for ${endpoint}:`, error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const authLogin = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB()
    
    const url = `${API_URL}/api/auth/login`
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'user-agent': req.headers['user-agent'],
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    })

    const data = await response.json()

    // Log login activity (successful or failed)
    try {
      if (response.ok && data.user) {
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

    return res.status(response.status).json(data)
  } catch (error: any) {
    console.error('Login proxy error:', error)
    
    // Log the error as failed login
    try {
      const email = req.body?.email || 'unknown'
      await connectDB()
      await logActivity({
        action: 'FAILED_LOGIN',
        request: req,
        details: {
          reason: error.message,
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
    
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const adminLogin = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToBackend(req, res, 'admin/login')
}

export const authRegister = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB()
    
    // Call proxy first to register
    const url = `${API_URL}/api/auth/register`
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'user-agent': req.headers['user-agent'],
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    })

    const data = await response.json()

    // If registration successful, log the activity
    if (response.ok && data.user) {
      try {
        await logActivity({
          user_id: data.user._id || data.user.id,
          action: 'REGISTER',
          request: req,
          details: {
            email: data.user.email,
            name: data.user.name,
          },
        })

        // Emit real-time event for audit log dashboard
        const io = (res.socket as any)?.server?.io
        if (io) {
          try {
            io.emit('audit_log', {
              action: 'REGISTER',
              user: data.user.name || data.user.email,
              email: data.user.email,
              timestamp: new Date().toISOString(),
            })
          } catch (socketErr) {
            console.warn('Socket emission failed:', socketErr)
          }
        }
      } catch (auditError) {
        console.warn('Failed to log registration activity:', auditError)
        // Continue even if audit log fails
      }
    }

    return res.status(response.status).json(data)
  } catch (error: any) {
    console.error('Registration error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const authVerify = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToBackend(req, res, 'verify')
}

export const authRefresh = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToBackend(req, res, 'refresh')
}

export const authForgotPassword = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToBackend(req, res, 'forgot-password')
}

export const authResetPassword = async (req: NextApiRequest, res: NextApiResponse) => {
  return proxyToBackend(req, res, 'reset-password')
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
  return proxyToBackend(req, res, 'verify-registration-otp')
}

const proxyToAdminBackend = async (req: NextApiRequest, res: NextApiResponse, endpoint: string) => {
  try {
    const url = `${API_URL}/api/admin/${endpoint}`
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Only pass safe headers
        'authorization': req.headers.authorization,
        'user-agent': req.headers['user-agent'],
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(response.status).json(data)
  } catch (error: any) {
    console.error(`Admin proxy error for ${endpoint}:`, error)
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
