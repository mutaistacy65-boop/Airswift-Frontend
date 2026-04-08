// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { verifyToken } from '@/lib/authController'
import { ObjectId } from 'mongodb'
import { DEFAULT_EMAIL_TEMPLATES } from '@/data/emailTemplates'

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

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  await connectDB()
  const db = mongoose.connection.db

  try {
    const {
      applicationIds,
      templateId,
      customSubject,
      customMessage,
      variables = {}
    } = req.body

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ message: 'Application IDs are required' })
    }

    if (!templateId && !customSubject) {
      return res.status(400).json({ message: 'Either templateId or customSubject is required' })
    }

    // Get applications to send emails to
    const objectIds = applicationIds.map((id: string) => new ObjectId(id))
    const applications = await db.collection('applications').find({
      _id: { $in: objectIds }
    }).toArray()

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applications found' })
    }

    // Get email template
    let template = null
    if (templateId) {
      template = await db.collection('emailTemplates').findOne({ id: templateId })
      if (!template) {
        template = DEFAULT_EMAIL_TEMPLATES.find(t => t.id === templateId) as any
      }
    }

    const emailPromises = applications.map(async (application) => {
      try {
        // Prepare email content
        let subject = customSubject || (template ? template.subject : 'TALEX Update')
        let body = customMessage || (template ? template.body : 'Please check your application status.')

        // Replace variables
        const emailVariables = {
          ...variables,
          applicantName: application.fullName || 'Applicant',
          jobTitle: application.jobTitle || 'Position',
          companyName: 'TALEX'
        }

        Object.entries(emailVariables).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g')
          subject = subject.replace(regex, value as string)
          body = body.replace(regex, value as string)
        })

        // Simulate email sending (in production, use actual email service)
        console.log(`Sending bulk email to ${application.email}`)
        console.log(`Subject: ${subject}`)
        console.log(`Body: ${body}`)

        // Store email record
        await db.collection('sentEmails').insertOne({
          recipientEmail: application.email,
          recipientName: application.fullName,
          subject,
          body,
          templateId,
          applicationId: application._id.toString(),
          sentBy: decoded.userId,
          sentAt: new Date(),
          type: 'bulk'
        })

        return { email: application.email, status: 'sent' }
      } catch (error) {
        console.error(`Failed to send email to ${application.email}:`, error)
        return { email: application.email, status: 'failed', error: error.message }
      }
    })

    const results = await Promise.all(emailPromises)

    const sentCount = results.filter(r => r.status === 'sent').length
    const failedCount = results.filter(r => r.status === 'failed').length

    return res.status(200).json({
      success: true,
      message: `Emails sent: ${sentCount}, Failed: ${failedCount}`,
      results
    })

  } catch (error) {
    console.error('Error sending bulk emails:', error)
    return res.status(500).json({ message: 'Failed to send bulk emails' })
  }
}