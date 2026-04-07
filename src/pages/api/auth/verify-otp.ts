import type { NextApiRequest, NextApiResponse } from 'next'
import { authVerifyOtp } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authVerifyOtp(req, res)
}