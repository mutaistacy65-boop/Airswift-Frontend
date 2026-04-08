// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/adminMiddleware'
import { getInterviews, scheduleInterview } from '@/lib/interviewController'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return getInterviews(req, res)
    case 'POST':
      return scheduleInterview(req, res)
    default:
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}

export default requireAdmin(handler)