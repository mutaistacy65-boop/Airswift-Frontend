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

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  await connectDB()
  const db = mongoose.connection.db

  try {
    const { applicationId, offerDetails } = req.body

    if (!applicationId) {
      return res.status(400).json({ message: 'Application ID is required' })
    }

    // Get application details
    const application = await db.collection('applications').findOne({ _id: new ObjectId(applicationId) })

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    // Get job details
    let jobDetails = null
    if (application.jobId) {
      jobDetails = await db.collection('jobs').findOne({ _id: new ObjectId(application.jobId) })
    }

    // Generate offer letter content
    const offerLetter = generateOfferLetter(application, jobDetails, offerDetails)

    // Store offer in database
    const offerData = {
      applicationId,
      applicantName: application.fullName,
      applicantEmail: application.email,
      jobTitle: application.jobTitle,
      companyName: jobDetails?.company || 'Airswift',
      offerDetails: {
        salary: offerDetails?.salary || 'TBD',
        startDate: offerDetails?.startDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        benefits: offerDetails?.benefits || [],
        conditions: offerDetails?.conditions || []
      },
      offerLetter,
      status: 'generated',
      createdBy: decoded.userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
    }

    const result = await db.collection('offers').insertOne(offerData)

    // Update application status
    await db.collection('applications').updateOne(
      { _id: new ObjectId(applicationId) },
      {
        $set: {
          status: 'offer_sent',
          offerId: result.insertedId.toString(),
          updatedAt: new Date()
        }
      }
    )

    return res.status(201).json({
      offerId: result.insertedId.toString(),
      offerLetter,
      status: 'generated'
    })

  } catch (error) {
    console.error('Error generating offer:', error)
    return res.status(500).json({ message: 'Failed to generate offer' })
  }
}

function generateOfferLetter(application: any, job: any, offerDetails: any) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const startDate = offerDetails?.startDate
    ? new Date(offerDetails.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'TBD'

  return `
[Company Letterhead]

${today}

${application.fullName}
${application.email}
${application.location || 'Address'}

Dear ${application.fullName},

JOB OFFER - ${application.jobTitle}

We are pleased to offer you the position of ${application.jobTitle} at ${job?.company || 'Airswift'}. We were impressed by your qualifications and experience, and we believe you will be a valuable addition to our team.

POSITION DETAILS:
- Job Title: ${application.jobTitle}
- Department: ${job?.category || 'General'}
- Location: ${job?.location || 'TBD'}
- Start Date: ${startDate}
- Employment Type: Full-time

COMPENSATION:
- Base Salary: ${offerDetails?.salary || 'TBD'} per annum
- Benefits: ${offerDetails?.benefits?.join(', ') || 'Health insurance, paid time off, professional development opportunities'}

CONDITIONS:
${offerDetails?.conditions?.map((condition: string) => `- ${condition}`).join('\n') || '- Successful completion of background check\n- Valid work permit/visa if applicable\n- Signing of employment contract'}

This offer is contingent upon:
1. Satisfactory completion of reference checks
2. Successful background verification
3. Medical examination clearance
4. Valid legal documentation for employment

Please indicate your acceptance of this offer by signing and returning this letter by ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')}.

We look forward to welcoming you to the ${job?.company || 'Airswift'} team!

Sincerely,

[Authorized Signatory]
Human Resources
${job?.company || 'Airswift'}

ACCEPTANCE OF OFFER:

I, ${application.fullName}, accept the offer of employment as outlined above.

Signature: ___________________________ Date: __________

`
}