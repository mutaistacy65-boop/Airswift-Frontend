// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/adminMiddleware'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()
    const db = mongoose.connection.db

    const { range = '7d' } = req.query
    let days = 7
    if (range === '30d') days = 30

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    const pipeline = [
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]

    const trends = await db.collection('applications').aggregate(pipeline).toArray()

    // Fill missing dates with 0
    const result = []
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const existing = trends.find(t => t._id === dateStr)
      result.push({
        date: dateStr,
        applications: existing ? existing.count : 0
      })
    }

    return res.status(200).json(result)
  } catch (error: any) {
    console.error('Error fetching trends:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export default requireAdmin(handler)