// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/adminMiddleware'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { sendEmail } from '@/utils/sendEmail'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    return handleStatusUpdate(req, res)
  }

  // For other methods, proxy to backend
  const { adminApplicationsById } = await import('@/lib/authController')
  return adminApplicationsById(req, res)
}

async function handleStatusUpdate(req: NextApiRequest, res: NextApiResponse) {
  await requireAdmin(req, res, async () => {
    const { id } = req.query
    const { action } = req.body || {}

    if (!id || !action) {
      return res.status(400).json({ message: 'ID and action required' })
    }

    try {
      await connectDB()
      const db = mongoose.connection.db

      let newStatus
      if (action === 'approve') {
        newStatus = 'accepted'
      } else if (action === 'reject') {
        newStatus = 'rejected'
      } else {
        return res.status(400).json({ message: 'Invalid action' })
      }

      // Update application status
      const result = await db.collection('applications').findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { status: newStatus, updated_at: new Date() } },
        { returnDocument: 'after' }
      )

      if (!result) {
        return res.status(404).json({ message: 'Application not found' })
      }

      const app = result

      // Get user and job details for email
      const user = await db.collection('users').findOne({ _id: app.userId })
      const job = await db.collection('jobs').findOne({ _id: app.jobId })

      if (user && job) {
        if (action === 'approve') {
          await sendEmail(
            user.email,
            "Application Approved 🎉",
            `
              <h2>Congratulations ${user.name}!</h2>
              <p>Your application for <strong>${job.title}</strong> has been <b>APPROVED</b>.</p>
              <p>We will contact you soon.</p>
            `
          )
        } else if (action === 'reject') {
          await sendEmail(
            user.email,
            "Application Update",
            `
              <h2>Hello ${user.name},</h2>
              <p>We regret to inform you that your application for <strong>${job.title}</strong> was not successful.</p>
              <p>Thank you for applying. Keep trying!</p>
            `
          )
        }
      }

      res.json(app)

    } catch (err) {
      console.error('Error updating application status:', err)
      res.status(500).json({ message: 'Internal server error' })
    }
  })
}
