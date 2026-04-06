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
    return res.status(400).json({ message: 'Interview ID is required' })
  }

  try {
    new ObjectId(id)
  } catch (error) {
    return res.status(400).json({ message: 'Invalid interview ID' })
  }

  const interviewId = new ObjectId(id)

  switch (req.method) {
    case 'GET':
      try {
        const interview = await db.collection('interviews').findOne({ _id: interviewId })

        if (!interview) {
          return res.status(404).json({ message: 'Interview not found' })
        }

        // Get application and job details
        let applicationDetails = null
        let jobDetails = null

        if (interview.applicationId) {
          try {
            const application = await db.collection('applications').findOne({ _id: new ObjectId(interview.applicationId) })
            if (application) {
              applicationDetails = {
                _id: application._id.toString(),
                fullName: application.fullName,
                email: application.email,
                jobTitle: application.jobTitle,
                phone: application.phone
              }

              // Get job details
              if (application.jobId) {
                const job = await db.collection('jobs').findOne({ _id: new ObjectId(application.jobId) })
                jobDetails = job ? {
                  _id: job._id.toString(),
                  title: job.title,
                  company: job.company,
                  location: job.location
                } : null
              }
            }
          } catch (error) {
            console.error('Error fetching application/job details:', error)
          }
        }

        return res.status(200).json({
          ...interview,
          _id: interview._id.toString(),
          application: applicationDetails,
          job: jobDetails
        })
      } catch (error) {
        console.error('Error fetching interview:', error)
        return res.status(500).json({ message: 'Failed to fetch interview' })
      }

    case 'PUT':
      try {
        const {
          interviewType,
          scheduledDate,
          interviewer,
          notes,
          meetingLink,
          status,
          feedback,
          score
        } = req.body

        const updateData: any = {
          updatedAt: new Date()
        }

        if (interviewType !== undefined) updateData.interviewType = interviewType
        if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate)
        if (interviewer !== undefined) updateData.interviewer = interviewer
        if (notes !== undefined) updateData.notes = notes
        if (meetingLink !== undefined) updateData.meetingLink = meetingLink
        if (status !== undefined) updateData.status = status
        if (feedback !== undefined) updateData.feedback = feedback
        if (score !== undefined) updateData.score = score

        const result = await db.collection('interviews').updateOne(
          { _id: interviewId },
          { $set: updateData }
        )

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Interview not found' })
        }

        // If interview is completed, update application status
        if (status === 'completed') {
          const interview = await db.collection('interviews').findOne({ _id: interviewId })
          if (interview && interview.applicationId) {
            await db.collection('applications').updateOne(
              { _id: new ObjectId(interview.applicationId) },
              {
                $set: {
                  status: 'interview_completed',
                  updatedAt: new Date()
                }
              }
            )
          }
        }

        const updatedInterview = await db.collection('interviews').findOne({ _id: interviewId })

        return res.status(200).json({
          ...updatedInterview,
          _id: updatedInterview._id.toString()
        })
      } catch (error) {
        console.error('Error updating interview:', error)
        return res.status(500).json({ message: 'Failed to update interview' })
      }

    case 'DELETE':
      try {
        const interview = await db.collection('interviews').findOne({ _id: interviewId })

        if (!interview) {
          return res.status(404).json({ message: 'Interview not found' })
        }

        // Remove interview reference from application
        if (interview.applicationId) {
          await db.collection('applications').updateOne(
            { _id: new ObjectId(interview.applicationId) },
            {
              $unset: { interviewId: 1 },
              $set: {
                status: 'shortlisted', // Reset to previous status
                updatedAt: new Date()
              }
            }
          )
        }

        const result = await db.collection('interviews').deleteOne({ _id: interviewId })

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Interview not found' })
        }

        return res.status(200).json({ message: 'Interview deleted successfully' })
      } catch (error) {
        console.error('Error deleting interview:', error)
        return res.status(500).json({ message: 'Failed to delete interview' })
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}