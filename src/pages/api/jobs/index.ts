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

  if (req.method === 'GET') {
    try {
      const jobs = await Job.find().sort({ created_at: -1 })
      return res.status(200).json({ success: true, jobs })
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const user = await getAuthUser(req)
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can create jobs' })
      }

      const { title, description } = req.body

      if (!title || !description) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      const job = new Job({
        title,
        description,
      })

      await job.save()

      return res.status(201).json({ success: true, job })
    } catch (error) {
      console.error('Error creating job:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
