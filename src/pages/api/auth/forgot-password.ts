import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' })
  }

  // Mock behavior: in production this will trigger a real email send.
  // Generate a mock reset token (in production, this would be a secure JWT or similar)
  const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Mock email content
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

  console.log(`Mock forgot password request received for: ${email}`)
  console.log(`Reset link: ${resetLink}`)
  console.log(`Mock email would contain: "Click here to reset your password: ${resetLink}"`)

  // In production, you would send an actual email here using a service like SendGrid, Mailgun, etc.

  return res.status(200).json({ message: 'Password reset instructions sent to your email.' })
}
