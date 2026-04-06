import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'

const formatApplication = (application: any) => ({
  ...application,
  id: application._id?.toString() || application.id,
  _id: application._id?.toString(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req
  const id = typeof query.id === 'string' ? query.id : ''

  if (!id) {
    return res.status(400).json({ message: 'Invalid application id' })
  }

  await connectDB()
  const db = mongoose.connection.db

  switch (method) {
    case 'GET': {
      try {
        const application = await db.collection('applications').findOne({ _id: new ObjectId(id) })
        if (!application) {
          return res.status(404).json({ message: 'Application not found' })
        }

        return res.status(200).json(formatApplication(application))
      } catch (error: any) {
        console.error('Error fetching application:', error)
        return res.status(500).json({ message: 'Internal server error' })
      }
    }

    case 'DELETE': {
      try {
        const deleteResult = await db.collection('applications').deleteOne({ _id: new ObjectId(id) })
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ message: 'Application not found' })
        }

        return res.status(200).json({ success: true, message: 'Application withdrawn' })
      } catch (error: any) {
        console.error('Error deleting application:', error)
        return res.status(500).json({ message: 'Internal server error' })
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'DELETE'])
      return res.status(405).json({ message: `Method ${method} Not Allowed` })
  }
}
