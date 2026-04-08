// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()
    const db = mongoose.connection.db

    // Get job categories with application counts
    const categories = await db.collection('jobcategories').find({}).toArray()

    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const jobCount = await db.collection('jobs').countDocuments({ category: category.name })
        const applicationCount = await db.collection('applications').countDocuments({
          jobId: {
            $in: (await db.collection('jobs').find({ category: category.name }).project({ _id: 1 }).toArray()).map(j => j._id)
          }
        })

        return {
          name: category.name,
          jobCount,
          applicationCount,
          icon: category.icon || 'briefcase'
        }
      })
    )

    // Get popular jobs
    const popularJobs = await db.collection('jobs').aggregate([
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'jobId',
          as: 'applications'
        }
      },
      {
        $addFields: {
          applicationCount: { $size: '$applications' }
        }
      },
      {
        $sort: { applicationCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 1,
          title: 1,
          company: 1,
          location: 1,
          applicationCount: 1
        }
      }
    ]).toArray()

    // Get recent jobs
    const recentJobs = await db.collection('jobs')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .project({ title: 1, company: 1, location: 1, createdAt: 1 })
      .toArray()

    return res.status(200).json({
      categories: categoryStats,
      popularJobs: popularJobs.map(job => ({
        ...job,
        _id: job._id.toString()
      })),
      recentJobs: recentJobs.map(job => ({
        ...job,
        _id: job._id.toString()
      }))
    })

  } catch (error) {
    console.error('Error fetching job dashboard data:', error)
    return res.status(500).json({ message: 'Failed to fetch dashboard data' })
  }
}