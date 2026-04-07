import type { NextApiRequest, NextApiResponse } from 'next'
import { adminSendInterview } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminSendInterview(req, res)
}
