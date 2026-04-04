import type { NextApiRequest, NextApiResponse } from 'next'

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map<string, { otp: string; expires: number; userData: any }>()

type Data = {
  message: string
  user?: any
  token?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' })
  }

  const storedData = otpStorage.get(email)

  if (!storedData) {
    return res.status(400).json({ message: 'OTP not found or expired' })
  }

  if (Date.now() > storedData.expires) {
    otpStorage.delete(email)
    return res.status(400).json({ message: 'OTP expired' })
  }

  if (storedData.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' })
  }

  // OTP verified, now register the user
  try {
    // Call your actual registration API
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiBaseUrl) {
      return res.status(500).json({ message: 'API base URL not configured' })
    }

    const response = await fetch(`${apiBaseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storedData.userData),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ message: data.message || 'Registration failed' })
    }

    // Clean up OTP storage
    otpStorage.delete(email)

    return res.status(200).json({
      message: 'Registration successful',
      user: data.user,
      token: data.token
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}