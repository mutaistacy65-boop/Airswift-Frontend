import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { generateVerificationToken } from '@/lib/emailVerificationHelper'
import { sendVerificationEmail } from '@/lib/emailService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, email, password, role } = req.body

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' })
  }

  try {
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification token
    const { token, hashedToken, expiresAt } = generateVerificationToken(10) // 10 minutes

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      isVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpires: expiresAt,
    })

    await newUser.save()

    // Send verification email
    try {
      await sendVerificationEmail(email, name, token)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail registration if email fails to send
      // In production, you might want to queue this for retry
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Check your email to verify your account.',
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return res.status(500).json({ 
      message: error.message || 'Internal server error during registration' 
    })
  }
}
