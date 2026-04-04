import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { db } = await connectToDatabase()

    const users = await db.collection('users').countDocuments()
    const applications = await db.collection('applications').countDocuments()
    const jobs = await db.collection('jobs').countDocuments()

    return res.status(200).json({ users, applications, jobs })
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
