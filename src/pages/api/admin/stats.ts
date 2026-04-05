import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()
    const db = mongoose.connection.db

    const users = await db.collection('users').countDocuments()
    const applications = await db.collection('applications').countDocuments()
    const jobs = await db.collection('jobs').countDocuments()

    return res.status(200).json({ users, applications, jobs })
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
