// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminLogin } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminLogin(req, res)
}
