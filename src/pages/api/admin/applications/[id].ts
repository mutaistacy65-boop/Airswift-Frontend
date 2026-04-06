import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid application id' })
  }

  await connectDB()
  const db = mongoose.connection.db

  switch (method) {
    case 'PATCH':
      try {
        const { status, notes } = req.body
        if (!status) {
          return res.status(400).json({ message: 'Status is required' })
        }

        const updateResult = await db.collection('applications').findOneAndUpdate(
          { _id: new ObjectId(id) },
          {
            $set: {
              status,
              updatedAt: new Date(),
              notes,
            },
          },
          { returnDocument: 'after' }
        )

        if (!updateResult.value) {
          return res.status(404).json({ message: 'Application not found' })
        }

        const updatedApplication = {
          ...updateResult.value,
          id: updateResult.value._id.toString(),
          _id: updateResult.value._id.toString(),
        }

        return res.status(200).json({ success: true, application: updatedApplication })
      } catch (error: any) {
        console.error('Error updating application', error)
        return res.status(500).json({ message: 'Internal server error' })
      }

    default:
      res.setHeader('Allow', ['PATCH'])
      return res.status(405).json({ message: `Method ${method} Not Allowed` })
  }
}
