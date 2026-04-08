import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Job from '@/lib/models/Job'
import User from '@/lib/models/User'
import jwt from 'jsonwebtoken'

const getAuthUser = async (req: NextApiRequest) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const user = await User.findById(decoded.userId)
    return user
  } catch (error) {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB()
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid job ID' })
  }

  if (req.method === 'GET') {
    try {
      const job = await Job.findById(id)

      if (!job) {
        return res.status(404).json({ message: 'Job not found' })
      }

      return res.status(200).json({ success: true, job })
    } catch (error) {
      console.error('Error fetching job:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'PUT') {
    try {
      const user = await getAuthUser(req)
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can update jobs' })
      }

      const { title, description } = req.body

      const job = await Job.findByIdAndUpdate(
        id,
        { title, description },
        { new: true }
      )

      if (!job) {
        return res.status(404).json({ message: 'Job not found' })
      }

      return res.status(200).json({ success: true, job })
    } catch (error) {
      console.error('Error updating job:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const user = await getAuthUser(req)
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can delete jobs' })
      }

      const job = await Job.findByIdAndDelete(id)

      if (!job) {
        return res.status(404).json({ message: 'Job not found' })
      }

      return res.status(200).json({ success: true, message: 'Job deleted' })
    } catch (error) {
      console.error('Error deleting job:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
