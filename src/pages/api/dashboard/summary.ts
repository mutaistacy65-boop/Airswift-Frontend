// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/adminMiddleware'
import { getDashboardSummary } from '@/lib/dashboardController'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return getDashboardSummary(req, res)
}

export default requireAdmin(handler)
