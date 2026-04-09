// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Notification from '@/lib/models/Notification'
import User from '@/lib/models/User'
import jwt from 'jsonwebtoken'

const getAuthUser = async (req: NextApiRequest) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '')
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
    return res.status(400).json({ message: 'Invalid notification ID' })
  }

  if (req.method === 'PUT') {
    try {
      const user = await getAuthUser(req)
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const notification = await Notification.findByIdAndUpdate(id, { is_read: true }, { new: true })

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' })
      }

      if (notification.user_id.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' })
      }

      return res.status(200).json({ success: true, notification })
    } catch (error) {
      console.error('Error updating notification:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['PUT'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
