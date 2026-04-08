// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { authResendVerification } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authResendVerification(req, res)
}
