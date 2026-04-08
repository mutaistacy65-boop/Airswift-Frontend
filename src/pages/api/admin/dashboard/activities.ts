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

    // Recent applications
    const recentApps = await db.collection('applications')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'jobs',
            localField: 'job_id',
            foreignField: '_id',
            as: 'job'
          }
        },
        {
          $sort: { created_at: -1 }
        },
        {
          $limit: 10
        }
      ])
      .toArray()

    // Recent jobs
    const recentJobs = await db.collection('jobs')
      .find({})
      .sort({ created_at: -1 })
      .limit(5)
      .toArray()

    // Recent interviews
    const recentInterviews = await db.collection('interviews')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'jobs',
            localField: 'job_id',
            foreignField: '_id',
            as: 'job'
          }
        },
        {
          $sort: { created_at: -1 }
        },
        {
          $limit: 5
        }
      ])
      .toArray()

    const activities = []

    // Add applications
    recentApps.forEach(app => {
      activities.push({
        type: 'application',
        message: `${app.user[0]?.name || 'Unknown'} applied for ${app.job[0]?.title || 'Unknown Job'}`,
        timestamp: app.created_at
      })
    })

    // Add jobs
    recentJobs.forEach(job => {
      activities.push({
        type: 'job',
        message: `New job posted: ${job.title}`,
        timestamp: job.created_at
      })
    })

    // Add interviews
    recentInterviews.forEach(interview => {
      activities.push({
        type: 'interview',
        message: `Interview scheduled for ${interview.user[0]?.name || 'Unknown'} - ${interview.job[0]?.title || 'Unknown Job'}`,
        timestamp: interview.created_at
      })
    })

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Take top 20
    const recentActivities = activities.slice(0, 20)

    return res.status(200).json(recentActivities)
  } catch (error: any) {
    console.error('Error fetching activities:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export default requireAdmin(handler)