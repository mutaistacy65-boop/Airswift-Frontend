// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { adminCategories } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return adminCategories(req, res)
}