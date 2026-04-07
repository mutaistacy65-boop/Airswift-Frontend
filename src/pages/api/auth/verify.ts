import type { NextApiRequest, NextApiResponse } from 'next'
import { authVerify } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authVerify(req, res)
}
