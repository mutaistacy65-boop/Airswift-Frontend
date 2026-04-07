import type { NextApiRequest, NextApiResponse } from 'next'
import { adminApplications } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminApplications(req, res)
}
