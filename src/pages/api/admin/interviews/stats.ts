// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/adminMiddleware'
import { getInterviewStats } from '@/lib/interviewController'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return getInterviewStats(req, res)
}

export default requireAdmin(handler)