import type { NextApiRequest, NextApiResponse } from 'next'
import { adminSendInterviewById } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminSendInterviewById(req, res)
}
