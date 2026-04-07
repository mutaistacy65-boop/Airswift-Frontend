import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { generateVerificationToken } from '@/lib/emailVerificationHelper'
import { sendVerificationEmail } from '@/lib/emailService'

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
        message: 'If an account exists with this email, a verification link has been sent.' 
      })
    }

    // If already verified, return success message
    if (user.isVerified) {
      return res.status(200).json({ 
        message: 'This account is already verified. You can login now.' 
      })
    }

    // Generate new verification token
    const { token, hashedToken, expiresAt } = generateVerificationToken(10) // 10 minutes

    // Update user with new token
    user.verificationToken = hashedToken
    user.verificationTokenExpires = expiresAt
    await user.save()

    // Send verification email (non-blocking)
    try {
      await sendVerificationEmail(email, user.name, token)
      console.log(`✅ Verification email resent to: ${email}`)
    } catch (emailError: any) {
      console.error(`❌ Email failed for resend verification (${email}):`, emailError.message)
      // Don't fail the request if email fails - token is still valid and user can retry
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a verification link has been sent. Check your inbox or spam folder.',
    })
  } catch (error: any) {
    console.error('Resend verification error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
