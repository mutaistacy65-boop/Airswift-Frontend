// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { verifyToken } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await connectDB()
    const db = mongoose.connection.db

    const payment = await db.collection('payments').findOne({
      user_id: user.userId,
    }).sort({ created_at: -1 })

    return res.json(payment)
  } catch (error: any) {
    console.error('Error fetching payment status:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}