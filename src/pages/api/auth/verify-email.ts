// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { authVerifyEmail } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  return authVerifyEmail(req, res)
}
