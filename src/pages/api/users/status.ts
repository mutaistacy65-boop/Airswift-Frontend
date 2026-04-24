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

    // Check if user has any applications
    const applicationCount = await db.collection('applications').countDocuments({
      userId: user.userId
    })

    return res.json({
      hasApplied: applicationCount > 0
    })
  } catch (error: any) {
    console.error('Error fetching user status:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}