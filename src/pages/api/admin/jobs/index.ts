import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { verifyToken } from '@/lib/authController'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify admin authentication
  let decoded: any = null
  try {
    decoded = await verifyToken(req)
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  await connectDB()
  const db = mongoose.connection.db

  switch (req.method) {
    case 'GET':
      try {
        const jobs = await db.collection('jobs').find({}).sort({ createdAt: -1 }).toArray()

        // Get application counts for each job
        const jobsWithCounts = await Promise.all(
          jobs.map(async (job) => {
            const applicationCount = await db.collection('applications').countDocuments({ jobId: job._id })
            return {
              ...job,
              _id: job._id.toString(),
              applicants: applicationCount,
              createdAt: job.createdAt || new Date(),
              updatedAt: job.updatedAt || new Date()
            }
          })
        )

        return res.status(200).json(jobsWithCounts)
      } catch (error) {
        console.error('Error fetching jobs:', error)
        return res.status(500).json({ message: 'Failed to fetch jobs' })
      }

    case 'POST':
      try {
        const {
          title,
          company,
          location,
          salary,
          jobType,
          description,
          requirements,
          category,
          applicationDeadline,
          status = 'active'
        } = req.body

        if (!title || !company || !location || !description) {
          return res.status(400).json({ message: 'Missing required fields' })
        }

        const newJob = {
          title,
          company,
          location,
          salary,
          jobType,
          description,
          requirements: Array.isArray(requirements) ? requirements : [],
          category,
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
          status,
          postedBy: decoded.userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const result = await db.collection('jobs').insertOne(newJob)

        return res.status(201).json({
          ...newJob,
          _id: result.insertedId.toString()
        })
      } catch (error) {
        console.error('Error creating job:', error)
        return res.status(500).json({ message: 'Failed to create job' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}