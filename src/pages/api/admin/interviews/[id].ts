import type { NextApiRequest, NextApiResponse } from 'next'
import { adminInterviewsById } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminInterviewsById(req, res)
}