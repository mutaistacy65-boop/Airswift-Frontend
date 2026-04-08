// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminEmailLogs } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminEmailLogs(req, res)
}
