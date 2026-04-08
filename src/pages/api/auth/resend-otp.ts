// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { authResendOtp } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authResendOtp(req, res)
}