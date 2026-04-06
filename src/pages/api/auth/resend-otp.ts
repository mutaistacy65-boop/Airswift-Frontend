import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    const response = await fetch('https://talex-backend.onrender.com/api/auth/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (response.ok) {
      res.status(200).json({ message: 'OTP resent successfully' })
    } else {
      res.status(response.status).json({ message: data.message || 'Failed to resend OTP' })
    }
  } catch (error) {
    console.error('Error resending OTP:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}