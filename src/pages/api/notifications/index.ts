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

  if (req.method === 'GET') {
    try {
      const user = await getAuthUser(req)
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const notifications = await Notification.find({ user_id: user._id }).sort({ created_at: -1 })
      const unreadCount = await Notification.countDocuments({ user_id: user._id, is_read: false })

      return res.status(200).json({ success: true, notifications, unreadCount })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
