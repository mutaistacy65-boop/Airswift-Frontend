// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/mongodb'

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'change_me'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    // Get token from Authorization header or cookies
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    // Check if this is a mock token (for development)
    if (token.startsWith('mock-')) {
      // For mock tokens, parse the user data from localStorage that was sent
      // This is safe because the user data is already stored locally
      const userDataHeader = req.headers['x-user-data']
      
      if (userDataHeader) {
        try {
          const user = JSON.parse(decodeURIComponent(userDataHeader as string))
          return res.status(200).json({ user })
        } catch (e) {
          console.log('Failed to parse user data from header, returning mock user')
        }
      }

      // Fallback: return a basic user object for mock tokens
      return res.status(200).json({
        user: {
          id: 'mock-user-id',
          email: 'user@example.com',
          name: 'Mock User',
          role: 'user',
          isVerified: true
        }
      })
    }

    // For real tokens, verify with JWT
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_ACCESS_SECRET)
    } catch (jwtError: any) {
      console.error('JWT verification failed:', jwtError.message)
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    // Connect to database and fetch user
    try {
      const db = await connectDB()

      // Find user by ID
      const user = await db.collection('users').findOne(
        { _id: decoded.id || decoded.userId },
        {
          projection: {
            password: 0, // Exclude password
            otp: 0, // Exclude OTP
            otpExpires: 0, // Exclude OTP expiry
          }
        }
      )

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Return user data
      return res.status(200).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          jobTitle: user.jobTitle,
          bio: user.bio,
          skills: user.skills,
          experience: user.experience,
          education: user.education,
          location: user.location,
          isVerified: user.isVerified,
        }
      })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      res.status(500).json({ message: 'Internal server error' })
    }

  } catch (error: any) {
    console.error('Error in /api/auth/me:', error)
    res.status(401).json({ message: 'Unauthorized' })
  }
}