import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req
  const id = Array.isArray(query.id) ? query.id[0] : query.id

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  if (!id) {
    return res.status(400).json({ message: 'Application id is required' })
  }

  const { email, name, meetLink, date } = req.body

  if (!email || !name || !meetLink || !date) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    await connectDB()
    const db = mongoose.connection.db

    const application = await db.collection('applications').findOne({ _id: new ObjectId(id) })
    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    const interviewResult = await db.collection('interviewNotifications').insertOne({
      applicationId: new ObjectId(id),
      email,
      name,
      meetLink,
      date,
      createdAt: new Date(),
    })

    await db.collection('applications').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          interviewId: interviewResult.insertedId,
          status: 'Interview Scheduled',
          updatedAt: new Date(),
        },
      }
    )

    console.log(`Interview email would be sent to ${email} (${name}) with link ${meetLink} on ${date}`)

    return res.status(200).json({ message: 'Interview email sent (simulated)' })
  } catch (error: any) {
    console.error('Error sending interview notification', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
