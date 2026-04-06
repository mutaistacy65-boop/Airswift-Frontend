import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'change_me'
const TOKEN_MAX_AGE = 60 * 60 * 24 // 1 day in seconds

const createTokenCookie = (token: string) =>
  cookie.serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  })

const sanitizeUser = (user: any) => ({
  id: user._id?.toString?.() || user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  phone: user.phone,
})

const findUserByEmail = async (email: string) => {
  await connectDB()
  const db = mongoose.connection.db
  return db.collection('users').findOne({ email })
}

const verifyPassword = async (password: string, storedPassword: string | undefined) => {
  if (!storedPassword) {
    return false
  }

  try {
    if (await bcrypt.compare(password, storedPassword)) {
      return true
    }
  } catch (error) {
    console.warn('Password compare failed, falling back to plaintext comparison.', error)
  }

  return password === storedPassword
}

const signJwt = (user: any) =>
  jwt.sign(
    {
      id: user._id?.toString?.(),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: '1d',
    },
  )

export const verifyToken = (req: NextApiRequest) => {
  return new Promise((resolve, reject) => {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      reject(new Error('No token provided'))
      return
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        reject(new Error('Invalid token'))
        return
    }

      resolve({
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role
      })
    })
  })
}

const loginHandler = async (req: NextApiRequest, res: NextApiResponse, requireAdmin = false) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { email, password } = req.body

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    const user = await findUserByEmail(email)

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Send OTP automatically
      const otp = Math.floor(100000 + Math.random() * 900000).toString()

      // Store OTP (in production, use Redis/database)
      const otpStorage = (global as any).loginOtpStorage || new Map()
      ;(global as any).loginOtpStorage = otpStorage

      otpStorage.set(email, {
        otp,
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      })

      // TODO: Send OTP via email
      console.log(`Login verification OTP for ${email}: ${otp}`)

      return res.status(401).json({
        redirect: "/verify-otp",
        email,
        message: 'Account not verified. Please verify your email.'
      })
    }

    if (requireAdmin && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = signJwt(user)
    res.setHeader('Set-Cookie', createTokenCookie(token))

    return res.status(200).json({
      success: true,
      accessToken: token,
      user: sanitizeUser(user),
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const authLogin = async (req: NextApiRequest, res: NextApiResponse) => loginHandler(req, res, false)
export const adminLogin = async (req: NextApiRequest, res: NextApiResponse) => loginHandler(req, res, true)
