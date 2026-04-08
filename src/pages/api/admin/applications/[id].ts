// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminApplicationsById } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminApplicationsById(req, res)
}
