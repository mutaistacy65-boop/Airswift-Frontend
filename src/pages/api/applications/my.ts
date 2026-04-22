// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'

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

  const userId = typeof req.query.userId === 'string' ? req.query.userId : ''
  if (!userId) {
    return res.status(400).json({ message: 'Missing required userId query param' })
  }

  try {
    await connectDB()
    const db = mongoose.connection.db
    const apps = await db
      .collection('applications')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    return res.status(200).json(apps.map(formatApplication))
  } catch (error: any) {
    console.error('Error fetching applications for user:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
