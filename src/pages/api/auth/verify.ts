import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { verifyTokenMatch, isTokenValid } from '@/lib/emailVerificationHelper'
import { sendWelcomeEmail } from '@/lib/emailService'
import crypto from 'crypto'

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'change_me'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_me'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const token = req.query.token || req.body.token

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'Verification token is required' })
  }

  try {
    await connectDB()

    // Hash the token using SHA256 for comparison
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    // Find user with matching verification token
    const user = await User.findOne({
      verificationToken: hashedToken,
    })

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid verification token' 
      })
    }

    // Check if token has expired
    if (!isTokenValid(user.verificationTokenExpires as Date)) {
      // Clean up expired token
      user.verificationToken = null
      user.verificationTokenExpires = null
      await user.save()

      return res.status(400).json({ 
        message: 'Verification token has expired. Please request a new one.' 
      })
    }

    // Mark user as verified and clear the token
    user.isVerified = true
    user.verificationToken = null
    user.verificationTokenExpires = null
    await user.save()

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail verification if welcome email fails
    }

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_ACCESS_SECRET,
      {
        expiresIn: '15m',
      }
    )

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
      },
      JWT_REFRESH_SECRET,
      {
        expiresIn: '7d',
      }
    )

    // Hash and store refresh token
    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    user.refreshToken = hashedRefreshToken
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login to your account.',
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      }
    })
  } catch (error: any) {
    console.error('Email verification error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
