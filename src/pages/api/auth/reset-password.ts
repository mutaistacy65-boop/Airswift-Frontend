// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { authResetPassword } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.query.token || req.body.token || null
  console.log('Incoming token:', token)
  return authResetPassword(req, res)
}