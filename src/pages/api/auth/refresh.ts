import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import crypto from 'crypto'

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'change_me'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_me'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { refreshToken } = req.body

  if (!refreshToken || typeof refreshToken !== 'string') {
    return res.status(400).json({ message: 'Refresh token is required' })
  }

  try {
    await connectDB()

    // Verify the refresh token signature
    const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET)

    // Find user and verify the refresh token matches
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Hash the refresh token to compare with stored value
    const hashedIncomingToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    if (user.refreshToken !== hashedIncomingToken) {
      return res.status(401).json({ message: 'Invalid refresh token' })
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_ACCESS_SECRET,
      {
        expiresIn: '15m', // Short-lived access token
      }
    )

    // Optionally refresh the refresh token as well (rotate it)
    const newRefreshToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
      },
      JWT_REFRESH_SECRET,
      {
        expiresIn: '7d', // Longer-lived refresh token
      }
    )

    // Hash and store new refresh token
    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex')

    user.refreshToken = hashedRefreshToken
    await user.save()

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      message: 'Token refreshed successfully',
    })
  } catch (error: any) {
    console.error('Token refresh error:', error)

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Refresh token expired. Please login again.' })
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid refresh token' })
    }

    return res.status(500).json({ message: 'Internal server error' })
  }
}
