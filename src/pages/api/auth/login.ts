import type { NextApiRequest, NextApiResponse } from 'next'
import { authLogin } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authLogin(req, res)
}
