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

  switch (req.method) {
    case 'GET':
      try {
        const { status, page = 1, limit = 10 } = req.query

        let query: any = {}

        if (status && status !== 'all') {
          query.status = status
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

        const interviews = await db
          .collection('interviews')
          .find(query)
          .sort({ scheduledDate: -1 })
          .skip(skip)
          .limit(parseInt(limit as string))
          .toArray()

        const total = await db.collection('interviews').countDocuments(query)

        // Get application and job details for each interview
        const interviewsWithDetails = await Promise.all(
          interviews.map(async (interview) => {
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
                    jobTitle: application.jobTitle
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

            return {
              ...interview,
              _id: interview._id.toString(),
              application: applicationDetails,
              job: jobDetails
            }
          })
        )

        return res.status(200).json({
          interviews: interviewsWithDetails,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string))
          }
        })
      } catch (error) {
        console.error('Error fetching interviews:', error)
        return res.status(500).json({ message: 'Failed to fetch interviews' })
      }

    case 'POST':
      try {
        const {
          applicationId,
          interviewType,
          scheduledDate,
          interviewer,
          notes,
          meetingLink
        } = req.body

        if (!applicationId || !interviewType || !scheduledDate) {
          return res.status(400).json({ message: 'Missing required fields' })
        }

        // Check if application exists
        const application = await db.collection('applications').findOne({ _id: new ObjectId(applicationId) })
        if (!application) {
          return res.status(404).json({ message: 'Application not found' })
        }

        const newInterview = {
          applicationId,
          interviewType, // 'video' or 'voice'
          scheduledDate: new Date(scheduledDate),
          interviewer: interviewer || 'Admin',
          notes: notes || '',
          meetingLink: meetingLink || '',
          status: 'scheduled',
          createdBy: decoded.userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const result = await db.collection('interviews').insertOne(newInterview)

        // Update application status and link interview
        await db.collection('applications').updateOne(
          { _id: new ObjectId(applicationId) },
          {
            $set: {
              status: 'interview_scheduled',
              interviewId: result.insertedId.toString(),
              updatedAt: new Date()
            }
          }
        )

        return res.status(201).json({
          ...newInterview,
          _id: result.insertedId.toString()
        })
      } catch (error) {
        console.error('Error creating interview:', error)
        return res.status(500).json({ message: 'Failed to create interview' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}