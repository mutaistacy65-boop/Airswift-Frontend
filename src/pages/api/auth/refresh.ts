import type { NextApiRequest, NextApiResponse } from 'next'
import { authRefresh } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authRefresh(req, res)
}
