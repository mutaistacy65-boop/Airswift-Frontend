// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { authRegister } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return authRegister(req, res)
}
