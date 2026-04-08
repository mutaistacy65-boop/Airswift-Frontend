import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import User from '@/lib/models/User'
import Notification from '@/lib/models/Notification'
import jwt from 'jsonwebtoken'

const getAuthUser = async (req: NextApiRequest) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const user = await User.findById(decoded.userId)
    return user
  } catch (error) {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req
  const id = typeof query.id === 'string' ? query.id : ''

  if (!id) {
    return res.status(400).json({ message: 'Invalid application id' })
  }

  await connectDB()

  switch (method) {
    case 'GET': {
      try {
        const application = await Application.findById(id)
          .populate('user_id', 'name email phone')
          .populate('job_id', 'title description')
        
        if (!application) {
          return res.status(404).json({ message: 'Application not found' })
        }

        return res.status(200).json({ success: true, application })
      } catch (error: any) {
        console.error('Error fetching application:', error)
        return res.status(500).json({ message: 'Internal server error' })
      }
    }

    case 'PUT': {
      try {
        const user = await getAuthUser(req)
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: 'Only admins can update application status' })
        }

        const { status } = req.body

        if (!['pending', 'shortlisted', 'rejected'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status' })
        }

        const application = await Application.findByIdAndUpdate(id, { status }, { new: true })
          .populate('user_id', 'name email phone')
          .populate('job_id', 'title description')

        if (!application) {
          return res.status(404).json({ message: 'Application not found' })
        }

        // Create notification
        if (status === 'shortlisted') {
          const notification = new Notification({
            user_id: application.user_id,
            title: 'Shortlisted!',
            message: `Congratulations! You have been shortlisted for ${application.job_id.title}. Check your messages for interview details.`,
            is_read: false,
          })
          await notification.save()
        } else if (status === 'rejected') {
          const notification = new Notification({
            user_id: application.user_id,
            title: 'Application Status',
            message: `Your application for ${application.job_id.title} was not selected. Feel free to apply for other positions.`,
            is_read: false,
          })
          await notification.save()
        }

        return res.status(200).json({ success: true, application })
      } catch (error: any) {
        console.error('Error updating application:', error)
        return res.status(500).json({ message: 'Internal server error' })
      }
    }

    case 'DELETE': {
      try {
        const application = await Application.findByIdAndDelete(id)
        if (!application) {
          return res.status(404).json({ message: 'Application not found' })
        }

        return res.status(200).json({ success: true, message: 'Application withdrawn' })
      } catch (error: any) {
        console.error('Error deleting application:', error)
        return res.status(500).json({ message: 'Internal server error' })
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ message: `Method ${method} Not Allowed` })
  }
}
