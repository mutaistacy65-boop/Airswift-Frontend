import type { NextApiRequest, NextApiResponse } from 'next'
import { authResetPassword } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authResetPassword(req, res)
}