import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid application id' })
  }

  const { db } = await connectToDatabase()

  switch (method) {
    case 'PATCH':
      try {
        const { status, notes } = req.body
        if (!status) {
          return res.status(400).json({ message: 'Status is required' })
        }

        const updateResult = await db.collection('applications').updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status,
              updatedAt: new Date(),
              notes,
            },
          }
        )

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ message: 'Application not found' })
        }

        return res.status(200).json({ message: 'Application status updated' })
      } catch (error: any) {
        console.error('Error updating application', error)
        return res.status(500).json({ message: 'Internal server error' })
      }

    default:
      res.setHeader('Allow', ['PATCH'])
      return res.status(405).json({ message: `Method ${method} Not Allowed` })
  }
}
