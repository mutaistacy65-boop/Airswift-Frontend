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

    // Job Views - assuming we have a views collection or log, for now use jobs count
    const jobViews = await db.collection('jobs').countDocuments()

    // Applications Submitted
    const applicationsSubmitted = await db.collection('applications').countDocuments()

    // Interviews Scheduled
    const interviewsScheduled = await db.collection('interviews').countDocuments()

    // Offers Made - assuming offers are in applications with status 'offered'
    const offersMade = await db.collection('applications').countDocuments({ status: { $in: ['offered', 'Offered', 'OFFERED'] } })

    // Hires
    const hires = await db.collection('applications').countDocuments({ status: { $in: ['Hired', 'hired', 'HIRED'] } })

    const funnel = [
      { stage: 'Job Views', count: jobViews },
      { stage: 'Applications Submitted', count: applicationsSubmitted },
      { stage: 'Interviews Scheduled', count: interviewsScheduled },
      { stage: 'Offers Made', count: offersMade },
      { stage: 'Hires', count: hires }
    ]

    return res.status(200).json(funnel)
  } catch (error: any) {
    console.error('Error fetching funnel:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export default requireAdmin(handler)