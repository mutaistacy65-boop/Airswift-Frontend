import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

const formatApplication = (application: any) => ({
  ...application,
  id: application._id?.toString() || application.id,
  _id: application._id?.toString(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()
    const db = mongoose.connection.db
    const apps = await db
      .collection('applications')
      .find({}, { projection: { fullName: 1, email: 1, jobId: 1, status: 1, documents: 1, aiScore: 1, createdAt: 1, updatedAt: 1, jobTitle: 1, applicantName: 1, applicantPhone: 1, interviewId: 1 } })
      .toArray()

    if (!apps || apps.length === 0) {
      const seedApps = [
        {
          fullName: 'Alice K.',
          email: 'alice@example.com',
          jobId: { title: 'Cleaner' },
          status: 'Submitted',
          aiScore: 72,
          documents: {
            passport: '/nowhere/passport_alice.pdf',
            nationalId: '/nowhere/nationalid_alice.pdf',
            cv: '/nowhere/cv_alice.pdf',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fullName: 'Bob M.',
          email: 'bob@example.com',
          jobId: { title: 'Driver' },
          status: 'Under Review',
          aiScore: 84,
          documents: {
            passport: '/nowhere/passport_bob.pdf',
            nationalId: '/nowhere/nationalid_bob.pdf',
            cv: '/nowhere/cv_bob.pdf',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      const insertResult = await db.collection('applications').insertMany(seedApps)
      const insertedApps = await db
        .collection('applications')
        .find({ _id: { $in: Object.values(insertResult.insertedIds) } })
        .toArray()
      return res.status(200).json(insertedApps.map(formatApplication))
    }

    return res.status(200).json(apps.map(formatApplication))
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
