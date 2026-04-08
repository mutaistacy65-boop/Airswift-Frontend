// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { authSendRegistrationOtp } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authSendRegistrationOtp(req, res)
}