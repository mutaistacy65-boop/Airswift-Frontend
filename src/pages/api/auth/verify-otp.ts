import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

// In-memory storage for login OTPs (in production, use Redis or database)
const getLoginOtpStorage = () => {
  const globalStorage = (global as any).loginOtpStorage || new Map()
  ;(global as any).loginOtpStorage = globalStorage
  return globalStorage
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { email, otp } = req.body

  if (!email || !otp || typeof email !== 'string' || typeof otp !== 'string') {
    return res.status(400).json({ message: 'Email and OTP are required' })
  }

  try {
    // Check if OTP exists and is valid
    const loginOtpStorage = getLoginOtpStorage()
    const storedData = loginOtpStorage.get(email)

    if (!storedData) {
      return res.status(400).json({ message: 'OTP not found or expired' })
    }

    if (Date.now() > storedData.expires) {
      loginOtpStorage.delete(email)
      return res.status(400).json({ message: 'OTP expired' })
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }

    // OTP verified, mark user as verified
    await connectDB()
    const db = mongoose.connection.db

    const result = await db.collection('users').updateOne(
      { email },
      { $set: { isVerified: true } }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Clean up OTP storage
    loginOtpStorage.delete(email)

    return res.status(200).json({
      message: 'Account verified successfully. You can now login.'
    })
  } catch (error: any) {
    console.error('OTP verification error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Helper function to store OTP for login verification
export const storeLoginOTP = (email: string, otp: string) => {
  const loginOtpStorage = getLoginOtpStorage()
  loginOtpStorage.set(email, {
    otp,
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
  })
}