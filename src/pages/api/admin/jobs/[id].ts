// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminJobsById } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminJobsById(req, res)
}