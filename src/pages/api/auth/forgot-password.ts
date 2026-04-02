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
  console.log(`Mock forgot password request received for: ${email}`)

  return res.status(200).json({ message: 'Password reset instructions sent to your email.' })
}
