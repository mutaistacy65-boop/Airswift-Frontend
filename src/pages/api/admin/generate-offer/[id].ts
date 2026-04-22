// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminGenerateOffer } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminGenerateOffer(req, res)
}