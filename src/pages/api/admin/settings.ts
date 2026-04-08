// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminSettings } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminSettings(req, res)
}