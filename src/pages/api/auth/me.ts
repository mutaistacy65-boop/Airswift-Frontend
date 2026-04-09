// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/authController'
import { connectDB } from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    // Verify the token
    const decoded = await verifyToken(req)

    // Connect to database
    const db = await connectDB()

    // Find user by ID
    const user = await db.collection('users').findOne(
      { _id: decoded.userId },
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
    res.status(200).json({
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

  } catch (error: any) {
    console.error('Error in /api/auth/me:', error)

    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    res.status(500).json({ message: 'Internal server error' })
  }
}