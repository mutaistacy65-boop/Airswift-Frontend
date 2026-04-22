// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/adminMiddleware'
import { updateInterviewStatus } from '@/lib/interviewController'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return updateInterviewStatus(req, res)
}

export default requireAdmin(handler)