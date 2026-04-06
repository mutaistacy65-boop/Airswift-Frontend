import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { verifyToken } from '@/lib/authController'
import { ObjectId } from 'mongodb'

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
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Job ID is required' })
  }

  try {
    const jobId = new ObjectId(id)
  } catch (error) {
    return res.status(400).json({ message: 'Invalid job ID' })
  }

  const jobId = new ObjectId(id)

  switch (req.method) {
    case 'GET':
      try {
        const job = await db.collection('jobs').findOne({ _id: jobId })

        if (!job) {
          return res.status(404).json({ message: 'Job not found' })
        }

        // Get application count
        const applicationCount = await db.collection('applications').countDocuments({ jobId })

        return res.status(200).json({
          ...job,
          _id: job._id.toString(),
          applicants: applicationCount
        })
      } catch (error) {
        console.error('Error fetching job:', error)
        return res.status(500).json({ message: 'Failed to fetch job' })
      }

    case 'PUT':
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
          status
        } = req.body

        const updateData: any = {
          updatedAt: new Date()
        }

        if (title !== undefined) updateData.title = title
        if (company !== undefined) updateData.company = company
        if (location !== undefined) updateData.location = location
        if (salary !== undefined) updateData.salary = salary
        if (jobType !== undefined) updateData.jobType = jobType
        if (description !== undefined) updateData.description = description
        if (requirements !== undefined) updateData.requirements = Array.isArray(requirements) ? requirements : []
        if (category !== undefined) updateData.category = category
        if (applicationDeadline !== undefined) updateData.applicationDeadline = applicationDeadline ? new Date(applicationDeadline) : null
        if (status !== undefined) updateData.status = status

        const result = await db.collection('jobs').updateOne(
          { _id: jobId },
          { $set: updateData }
        )

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Job not found' })
        }

        const updatedJob = await db.collection('jobs').findOne({ _id: jobId })
        const applicationCount = await db.collection('applications').countDocuments({ jobId })

        return res.status(200).json({
          ...updatedJob,
          _id: updatedJob._id.toString(),
          applicants: applicationCount
        })
      } catch (error) {
        console.error('Error updating job:', error)
        return res.status(500).json({ message: 'Failed to update job' })
      }

    case 'DELETE':
      try {
        const result = await db.collection('jobs').deleteOne({ _id: jobId })

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Job not found' })
        }

        return res.status(200).json({ message: 'Job deleted successfully' })
      } catch (error) {
        console.error('Error deleting job:', error)
        return res.status(500).json({ message: 'Failed to delete job' })
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}