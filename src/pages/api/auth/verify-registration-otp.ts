// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { authVerifyRegistrationOtp } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authVerifyRegistrationOtp(req, res)
}