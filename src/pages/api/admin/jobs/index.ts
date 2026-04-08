// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminJobs } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminJobs(req, res)
}