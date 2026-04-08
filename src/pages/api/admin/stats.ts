// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminStats } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminStats(req, res)
}
