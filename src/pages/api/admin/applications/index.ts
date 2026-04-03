import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { db } = await connectToDatabase()
    const apps = await db
      .collection('applications')
      .find({}, { projection: { fullName: 1, email: 1, jobId: 1, status: 1, passport: 1, nationalId: 1, createdAt: 1 } })
      .toArray()

    if (!apps || apps.length === 0) {
      const seedApps = [
        {
          fullName: 'Alice K.',
          email: 'alice@example.com',
          jobId: { title: 'Cleaner' },
          status: 'pending',
          passport: '/nowhere/passport_alice.pdf',
          nationalId: '/nowhere/nationalid_alice.pdf',
          createdAt: new Date(),
        },
        {
          fullName: 'Bob M.',
          email: 'bob@example.com',
          jobId: { title: 'Driver' },
          status: 'reviewed',
          passport: '/nowhere/passport_bob.pdf',
          nationalId: '/nowhere/nationalid_bob.pdf',
          createdAt: new Date(),
        },
      ]
      await db.collection('applications').insertMany(seedApps)
      return res.status(200).json(seedApps)
    }

    return res.status(200).json(apps)
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
