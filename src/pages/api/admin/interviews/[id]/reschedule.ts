// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/adminMiddleware'
import { rescheduleInterview } from '@/lib/interviewController'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return rescheduleInterview(req, res)
}

export default requireAdmin(handler)