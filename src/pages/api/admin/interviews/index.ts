import type { NextApiRequest, NextApiResponse } from 'next'
import { adminInterviews } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminInterviews(req, res)
}