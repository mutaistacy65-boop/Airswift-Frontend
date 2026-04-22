// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import jwt from 'jsonwebtoken'
import { sendEmail } from '@/lib/emailService'

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'change_me'

const verifyToken = (req: NextApiRequest) => {
  return new Promise((resolve, reject) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.accessToken

    if (!token) {
      reject(new Error('No token provided'))
      return
    }

    jwt.verify(token, JWT_ACCESS_SECRET, (err: any, decoded: any) => {
      if (err) {
        reject(new Error('Invalid token'))
        return
      }

      resolve({
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role,
      })
    })
  })
}

const generateStatusEmail = (application: any, status: string) => {
  const applicantName = application.user_id?.name || 'Applicant'
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://airswift-frontend.vercel.app'

  if (status === 'shortlisted') {
    return {
      subject: 'Application Update – You\'ve Been Shortlisted',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c3e50;">Application Update</h2>
          <p>Dear ${applicantName},</p>
          <p>
            Thank you for your interest in joining our team. We are pleased to inform you
            that after careful review of your application, you have been <strong>shortlisted</strong>
            for the next stage of our selection process.
          </p>
          <p>
            Our team will be reaching out to you shortly with further details regarding
            the next steps.
          </p>
          <p>
            We appreciate your time and effort in applying and look forward to speaking with you.
          </p>
          <br/>
          <p style="margin-top:20px;">
            <a href="${frontendUrl}"
               style="background:#007bff;color:#fff;padding:10px 15px;
                      text-decoration:none;border-radius:5px;">
              Visit Your Dashboard
            </a>
          </p>
          <br/>
          <p>Kind regards,</p>
          <p><strong>Talex Recruitment Team</strong></p>
        </div>
      `
    }
  } else if (status === 'accepted') {
    return {
      subject: 'Application Successful',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Dear ${applicantName},</p>
          <p>
            We are delighted to inform you that your application has been
            <strong>successful</strong>.
          </p>
          <p>Our team will contact you with further onboarding details.</p>
          <p>Congratulations and welcome aboard!</p>
          <br/>
          <p style="margin-top:20px;">
            <a href="${frontendUrl}"
               style="background:#007bff;color:#fff;padding:10px 15px;
                      text-decoration:none;border-radius:5px;">
              Visit Your Dashboard
            </a>
          </p>
          <br/>
          <p>Best regards,<br/>Talex Team</p>
        </div>
      `
    }
  } else if (status === 'rejected') {
    return {
      subject: 'Application Update',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Dear ${applicantName},</p>
          <p>
            Thank you for your interest in joining our team.
          </p>
          <p>
            After careful consideration, we regret to inform you that we will not
            be progressing with your application at this time.
          </p>
          <p>
            We truly appreciate your effort and encourage you to apply again in the future.
          </p>
          <br/>
          <p style="margin-top:20px;">
            <a href="${frontendUrl}"
               style="background:#007bff;color:#fff;padding:10px 15px;
                      text-decoration:none;border-radius:5px;">
              Visit Your Dashboard
            </a>
          </p>
          <br/>
          <p>Kind regards,<br/>Talex Team</p>
        </div>
      `
    }
  }

  return null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB()

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Verify admin access
    let user
    try {
      user = await verifyToken(req)
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (!user || (user as any).role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" })
    }

    const { id } = req.query
    const { status } = req.body

    if (!id || !status) {
      return res.status(400).json({ message: 'Application ID and status are required' })
    }

    // Validate status
    const validStatuses = ['pending', 'shortlisted', 'accepted', 'rejected']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    // Update application status
    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user_id', 'name email')
     .populate('job_id', 'title')

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    // Send email notification if status changed to shortlisted, accepted, or rejected
    if (['shortlisted', 'accepted', 'rejected'].includes(status) && application.user_id?.email) {
      try {
        const emailContent = generateStatusEmail(application, status)
        if (emailContent) {
          await sendEmail(
            application.user_id.email,
            emailContent.subject,
            '', // text version (empty for now)
            emailContent.html
          )
          console.log(`Status update email sent to ${application.user_id.email} for status: ${status}`)
        }
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return res.status(200).json({
      success: true,
      application,
      message: `Application ${status} successfully`
    })

  } catch (error) {
    console.error('Error updating application status:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}