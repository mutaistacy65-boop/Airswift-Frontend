import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { generateVerificationToken } from '@/lib/emailVerificationHelper'
import { sendPasswordResetEmail } from '@/lib/emailService'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    await connectDB()

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).json({
        message: 'If an account exists with this email, a password reset link has been sent.'
      })
    }

    // Generate reset token (1 hour expiry)
    const { token: resetToken, hashedToken, expiresAt } = generateVerificationToken(60)

    // Update user with reset token
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = expiresAt
    await user.save()

    // Send reset email
    try {
      await sendPasswordResetEmail(email, user.name, resetToken)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      return res.status(500).json({
        message: 'Failed to send password reset email. Please try again.'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email! Check your inbox.',
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
