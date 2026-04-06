import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { verifyToken } from '@/lib/authController'
import { ObjectId } from 'mongodb'

const formatApplication = (application: any) => ({
  ...application,
  id: application._id?.toString() || application.id,
  _id: application._id?.toString(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        const { status, page = 1, limit = 10, search } = req.query

        let query: any = {}

        if (status && status !== 'all') {
          query.status = status
        }

        if (search) {
          query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { jobTitle: { $regex: search, $options: 'i' } }
          ]
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

        const apps = await db
          .collection('applications')
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit as string))
          .toArray()

        const total = await db.collection('applications').countDocuments(query)

        // Get job details for each application
        const appsWithJobDetails = await Promise.all(
          apps.map(async (app) => {
            let jobDetails = null
            if (app.jobId && typeof app.jobId === 'string') {
              try {
                const job = await db.collection('jobs').findOne({ _id: new ObjectId(app.jobId) })
                jobDetails = job ? {
                  _id: job._id.toString(),
                  title: job.title,
                  company: job.company,
                  location: job.location
                } : null
              } catch (error) {
                console.error('Error fetching job details:', error)
              }
            }

            return {
              ...formatApplication(app),
              job: jobDetails
            }
          })
        )

        return res.status(200).json({
          applications: appsWithJobDetails,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string))
          }
        })
      } catch (error: any) {
        console.error('Error fetching applications:', error)
        return res.status(500).json({ message: 'Internal server error' })
      }

    case 'PATCH':
      try {
        const { applicationIds, status, bulkAction } = req.body

        if (!applicationIds || !Array.isArray(applicationIds)) {
          return res.status(400).json({ message: 'Application IDs are required' })
        }

        if (bulkAction === 'status_update' && !status) {
          return res.status(400).json({ message: 'Status is required for bulk status update' })
        }

        const objectIds = applicationIds.map((id: string) => new ObjectId(id))

        let updateData: any = {
          updatedAt: new Date()
        }

        if (bulkAction === 'status_update') {
          updateData.status = status
        }

        const result = await db.collection('applications').updateMany(
          { _id: { $in: objectIds } },
          { $set: updateData }
        )

        return res.status(200).json({
          message: `Updated ${result.modifiedCount} applications`,
          modifiedCount: result.modifiedCount
        })
      } catch (error) {
        console.error('Error bulk updating applications:', error)
        return res.status(500).json({ message: 'Failed to update applications' })
      }

    default:
      res.setHeader('Allow', ['GET', 'PATCH'])
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
