import type { NextApiRequest, NextApiResponse } from 'next'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'

export const getDashboardSummary = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()
    const db = mongoose.connection.db

    const totalApplications = await db.collection('applications').countDocuments()
    const totalJobs = await db.collection('jobs').countDocuments()
    const totalInterviews = await db.collection('interviews').countDocuments()
    const totalHired = await db
      .collection('applications')
      .countDocuments({ status: { $in: ['Hired', 'hired', 'HIRED'] } })

    const scoreDocs = await db
      .collection('applications')
      .find({ aiScore: { $exists: true } }, { projection: { aiScore: 1 } })
      .toArray()

    const scoreValues = scoreDocs.map((doc: any) => Number(doc.aiScore) || 0)
    const averageScore = scoreValues.length
      ? Number((scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length).toFixed(1))
      : 0

    const summary = {
      applications: totalApplications,
      jobs: totalJobs,
      interviews: totalInterviews,
      hired: totalHired,
    }

    return res.status(200).json({
      totalApplications,
      totalJobs,
      totalInterviews,
      totalHired,
      averageScore,
      summary,
    })
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
