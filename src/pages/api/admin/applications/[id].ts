import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { verifyToken } from '@/lib/authController'

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

  const {
    query: { id },
    method,
  } = req

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid application id' })
  }

  try {
    new ObjectId(id)
  } catch (error) {
    return res.status(400).json({ message: 'Invalid application ID format' })
  }

  await connectDB()
  const db = mongoose.connection.db

  switch (method) {
    case 'GET':
      try {
        const application = await db.collection('applications').findOne({ _id: new ObjectId(id) })

        if (!application) {
          return res.status(404).json({ message: 'Application not found' })
        }

        // Get job details
        let jobDetails = null
        if (application.jobId && typeof application.jobId === 'string') {
          try {
            const job = await db.collection('jobs').findOne({ _id: new ObjectId(application.jobId) })
            jobDetails = job ? {
              _id: job._id.toString(),
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
              requirements: job.requirements
            } : null
          } catch (error) {
            console.error('Error fetching job details:', error)
          }
        }

        // Get interview details if exists
        let interviewDetails = null
        if (application.interviewId && typeof application.interviewId === 'string') {
          try {
            const interview = await db.collection('interviews').findOne({ _id: new ObjectId(application.interviewId) })
            interviewDetails = interview ? {
              _id: interview._id.toString(),
              type: interview.type,
              scheduledDate: interview.scheduledDate,
              status: interview.status,
              feedback: interview.feedback,
              score: interview.score
            } : null
          } catch (error) {
            console.error('Error fetching interview details:', error)
          }
        }

        const formattedApplication = {
          ...application,
          id: application._id.toString(),
          _id: application._id.toString(),
          job: jobDetails,
          interview: interviewDetails
        }

        return res.status(200).json(formattedApplication)
      } catch (error: any) {
        console.error('Error fetching application:', error)
        return res.status(500).json({ message: 'Failed to fetch application' })
      }

    case 'PATCH':
      try {
        const { status, notes, adminNotes } = req.body

        const updateData: any = {
          updatedAt: new Date()
        }

        if (status !== undefined) updateData.status = status
        if (notes !== undefined) updateData.notes = notes
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes

        const updateResult = await db.collection('applications').findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        )

        if (!updateResult.value) {
          return res.status(404).json({ message: 'Application not found' })
        }

        const updatedApplication = {
          ...updateResult.value,
          id: updateResult.value._id.toString(),
          _id: updateResult.value._id.toString(),
        }

        return res.status(200).json({ success: true, application: updatedApplication })
      } catch (error: any) {
        console.error('Error updating application', error)
        return res.status(500).json({ message: 'Internal server error' })
      }

    case 'POST':
      try {
        const { note } = req.body

        if (!note || !note.trim()) {
          return res.status(400).json({ message: 'Note content is required' })
        }

        const noteData = {
          _id: new ObjectId(),
          content: note.trim(),
          createdBy: decoded.userId,
          createdAt: new Date()
        }

        const updateResult = await db.collection('applications').findOneAndUpdate(
          { _id: new ObjectId(id) },
          {
            $push: { adminNotes: noteData },
            $set: { updatedAt: new Date() }
          },
          { returnDocument: 'after' }
        )

        if (!updateResult.value) {
          return res.status(404).json({ message: 'Application not found' })
        }

        return res.status(201).json({
          success: true,
          note: {
            ...noteData,
            _id: noteData._id.toString()
          }
        })
      } catch (error: any) {
        console.error('Error adding note:', error)
        return res.status(500).json({ message: 'Failed to add note' })
      }

    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'POST'])
      return res.status(405).json({ message: `Method ${method} Not Allowed` })
  }
}
