// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { authResendVerification } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  return authResendVerification(req, res)
}
