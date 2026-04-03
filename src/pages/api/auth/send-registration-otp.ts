import type { NextApiRequest, NextApiResponse } from 'next'

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map<string, { otp: string; expires: number; userData: any }>()

type Data = {
  message: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, email, password, role } = req.body

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // Store OTP with expiration (5 minutes)
  const expires = Date.now() + 5 * 60 * 1000
  otpStorage.set(email, {
    otp,
    expires,
    userData: { name, email, password, role }
  })

  // In production, send email here using your email service
  console.log(`Registration OTP for ${email}: ${otp}`)

  return res.status(200).json({ message: 'OTP sent to your email' })
}