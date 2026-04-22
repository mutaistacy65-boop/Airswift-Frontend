// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import Interview from '@/lib/models/Interview'
import InterviewFeedback from '@/lib/models/InterviewFeedback'
import InterviewParticipant from '@/lib/models/InterviewParticipant'
import User from '@/lib/models/User'
import Job from '@/lib/models/Job'
import Application from '@/lib/models/Application'
import { requireAdmin } from '@/lib/adminMiddleware'

// Type cast models to bypass Mongoose typing issues
const InterviewModel = Interview as any
const FeedbackModel = InterviewFeedback as any
const PArticipantModel = InterviewParticipant as any
const UserModel = User as any
const JobModel = Job as any
const ApplicationModel = Application as any

// Get all interviews with filtering and pagination
export const getInterviews = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()

    const {
      page = 1,
      limit = 20,
      status,
      interviewerId,
      dateFrom,
      dateTo,
      candidateName,
      jobTitle
    } = req.query

    const query: any = {}

    // Filters
    if (status) query.status = status
    if (interviewerId) query.interviewerId = interviewerId
    if (dateFrom || dateTo) {
      query.scheduledAt = {}
      if (dateFrom) query.scheduledAt.$gte = new Date(dateFrom as string)
      if (dateTo) query.scheduledAt.$lte = new Date(dateTo as string)
    }

    // Search by candidate name or job title
    if (candidateName || jobTitle) {
      const userIds = candidateName ? await (User as any).find({
        name: { $regex: candidateName, $options: 'i' }
      }).distinct('_id') : []

      const jobIds = jobTitle ? await (Job as any).find({
        title: { $regex: jobTitle, $options: 'i' }
      }).distinct('_id') : []

      if (candidateName && userIds.length > 0) query.candidateId = { $in: userIds }
      if (jobTitle && jobIds.length > 0) query.jobId = { $in: jobIds }
    }

    const skip = (Number(page) - 1) * Number(limit)

    const interviews = await (Interview as any).find(query)
      .populate('candidateId', 'name email')
      .populate('jobId', 'title')
      .populate('interviewerId', 'name email')
      .populate('applicationId', 'status')
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean()

    const total = await Interview.countDocuments(query)

    // Transform data for frontend compatibility
    const transformedInterviews = interviews.map(interview => ({
      _id: interview._id,
      id: interview._id,
      applicationId: interview.applicationId,
      candidateName: (interview.candidateId as any)?.name || 'Unknown',
      candidateEmail: (interview.candidateId as any)?.email || '',
      jobTitle: (interview.jobId as any)?.title || 'Unknown Job',
      scheduledDate: interview.scheduledAt.toISOString().split('T')[0],
      scheduledTime: interview.scheduledAt.toTimeString().slice(0, 5),
      status: interview.status,
      interviewerName: (interview.interviewerId as any)?.name || '',
      interviewType: interview.interviewType,
      zoomLink: interview.meetingLink,
      location: interview.mode === 'in-person' ? 'Office' : '',
      notes: interview.notes,
      duration: interview.duration,
      mode: interview.mode
    }))

    return res.status(200).json({
      interviews: transformedInterviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error: any) {
    console.error('Error fetching interviews:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Get interview by ID
export const getInterviewById = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()
    const { id } = req.query

    const interview = await (Interview as any).findById(id)
      .populate('candidateId', 'name email phone')
      .populate('jobId', 'title description')
      .populate('interviewerId', 'name email')
      .populate('applicationId', 'status coverLetter')
      .populate('participants', 'name email')
      .lean()

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' })
    }

    // Get feedback if exists
    const feedback = await (InterviewFeedback as any).find({ interviewId: id })
      .populate('interviewerId', 'name')
      .lean()

    return res.status(200).json({
      interview: {
        ...interview,
        candidateName: (interview.candidateId as any)?.name,
        candidateEmail: (interview.candidateId as any)?.email,
        candidatePhone: (interview.candidateId as any)?.phone,
        jobTitle: (interview.jobId as any)?.title,
        interviewerName: (interview.interviewerId as any)?.name,
        applicationStatus: (interview.applicationId as any)?.status
      },
      feedback
    })
  } catch (error: any) {
    console.error('Error fetching interview:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Schedule new interview
export const scheduleInterview = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()

    const {
      applicationId,
      candidateId,
      jobId,
      interviewerId,
      scheduledAt,
      duration = 60,
      mode = 'online',
      meetingLink,
      interviewType = 'HR',
      notes,
      participants = []
    } = req.body

    // Validate required fields
    if (!applicationId || !candidateId || !jobId || !scheduledAt) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Check if application exists
    const application = await Application.findById(applicationId)
    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    // Create interview
    const interview = new Interview({
      applicationId,
      candidateId,
      jobId,
      interviewerId,
      scheduledAt: new Date(scheduledAt),
      duration,
      mode,
      meetingLink,
      interviewType,
      notes,
      participants
    })

    await interview.save()

    // Add participants if provided
    if (participants && participants.length > 0) {
      const participantDocs = participants.map((userId: string) => ({
        interviewId: interview._id,
        userId,
        role: 'panel'
      }))
      await InterviewParticipant.insertMany(participantDocs)
    }

    // Populate and return
    await interview.populate([
      { path: 'candidateId', select: 'name email' },
      { path: 'jobId', select: 'title' },
      { path: 'interviewerId', select: 'name email' }
    ])

    return res.status(201).json({
      message: 'Interview scheduled successfully',
      interview
    })
  } catch (error: any) {
    console.error('Error scheduling interview:', error)
    if (error.message.includes('conflicting interview')) {
      return res.status(409).json({ message: error.message })
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Update interview
export const updateInterview = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()
    const { id } = req.query
    const updates = req.body

    // Prevent updating completed interviews
    if (updates.status === 'completed') {
      const interview = await (Interview as any).findById(id)
      if (interview && interview.status === 'completed') {
        return res.status(400).json({ message: 'Cannot modify completed interviews' })
      }
    }

    const interview = await Interview.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      { path: 'candidateId', select: 'name email' },
      { path: 'jobId', select: 'title' },
      { path: 'interviewerId', select: 'name email' }
    ])

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' })
    }

    return res.status(200).json({
      message: 'Interview updated successfully',
      interview
    })
  } catch (error: any) {
    console.error('Error updating interview:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Reschedule interview
export const rescheduleInterview = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()
    const { id } = req.query
    const { scheduledAt, reason } = req.body

    if (!scheduledAt) {
      return res.status(400).json({ message: 'New schedule time is required' })
    }

    const interview = await Interview.findByIdAndUpdate(
      id,
      {
        scheduledAt: new Date(scheduledAt),
        status: 'rescheduled',
        notes: `${interview.notes || ''}\n\nRescheduled: ${reason || 'No reason provided'}`.trim(),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'candidateId', select: 'name email' },
      { path: 'jobId', select: 'title' },
      { path: 'interviewerId', select: 'name email' }
    ])

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' })
    }

    // TODO: Send reschedule notifications

    return res.status(200).json({
      message: 'Interview rescheduled successfully',
      interview
    })
  } catch (error: any) {
    console.error('Error rescheduling interview:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Update interview status
export const updateInterviewStatus = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()
    const { id } = req.query
    const { status } = req.body

    const validStatuses = ['scheduled', 'completed', 'no-show', 'cancelled', 'rescheduled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const interview = await Interview.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate([
      { path: 'candidateId', select: 'name email' },
      { path: 'jobId', select: 'title' },
      { path: 'interviewerId', select: 'name email' }
    ])

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' })
    }

    // TODO: Send status update notifications

    return res.status(200).json({
      message: `Interview status updated to ${status}`,
      interview
    })
  } catch (error: any) {
    console.error('Error updating interview status:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Get calendar data
export const getCalendarData = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()
    const { month, year } = req.query

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' })
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1)
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59)

    const interviews = await (Interview as any).find({
      scheduledAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['scheduled', 'rescheduled'] }
    })
    .populate('candidateId', 'name')
    .populate('jobId', 'title')
    .populate('interviewerId', 'name')
    .lean()

    // Group by date
    const calendarData: { [key: string]: any[] } = {}

    interviews.forEach(interview => {
      const dateKey = interview.scheduledAt.toISOString().split('T')[0]
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = []
      }

      calendarData[dateKey].push({
        id: interview._id,
        time: interview.scheduledAt.toTimeString().slice(0, 5),
        candidateName: (interview.candidateId as any)?.name || 'Unknown',
        jobTitle: (interview.jobId as any)?.title || 'Unknown Job',
        interviewerName: (interview.interviewerId as any)?.name || 'Unknown',
        type: interview.interviewType,
        status: interview.status,
        mode: interview.mode,
        meetingLink: interview.meetingLink
      })
    })

    return res.status(200).json(calendarData)
  } catch (error: any) {
    console.error('Error fetching calendar data:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Get interview statistics
export const getInterviewStats = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()

    const [
      scheduledCount,
      completedCount,
      noShowCount,
      cancelledCount
    ] = await Promise.all([
      Interview.countDocuments({ status: 'scheduled' }),
      Interview.countDocuments({ status: 'completed' }),
      Interview.countDocuments({ status: 'no-show' }),
      Interview.countDocuments({ status: 'cancelled' })
    ])

    // Calculate conversion rate (completed / total scheduled)
    const totalProcessed = completedCount + noShowCount + cancelledCount
    const conversionRate = totalProcessed > 0 ? (completedCount / totalProcessed * 100) : 0

    return res.status(200).json({
      scheduled: scheduledCount,
      completed: completedCount,
      noShow: noShowCount,
      cancelled: cancelledCount,
      conversionRate: Math.round(conversionRate * 100) / 100
    })
  } catch (error: any) {
    console.error('Error fetching interview stats:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}