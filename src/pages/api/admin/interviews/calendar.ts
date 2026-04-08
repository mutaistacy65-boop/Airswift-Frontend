// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/adminMiddleware'
import { getCalendarData } from '@/lib/interviewController'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return getCalendarData(req, res)
}

export default requireAdmin(handler)