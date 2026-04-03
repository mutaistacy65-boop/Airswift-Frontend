import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' })
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' })
  }

  // Mock behavior: in production this will validate the token and update the password
  console.log(`Mock password reset request received. Token: ${token}, New password length: ${password.length}`)

  // In a real implementation, you would:
  // 1. Validate the token (check if it's valid and not expired)
  // 2. Find the user associated with the token
  // 3. Hash the new password
  // 4. Update the user's password in the database
  // 5. Invalidate the token

  return res.status(200).json({ message: 'Password reset successfully' })
}