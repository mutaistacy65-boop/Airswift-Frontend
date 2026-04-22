// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Message from '@/lib/models/Message'
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
    return res.status(400).json({ message: 'Invalid message ID' })
  }

  if (req.method === 'GET') {
    try {
      const message = await Message.findById(id)

      if (!message) {
        return res.status(404).json({ message: 'Message not found' })
      }

      const user = await getAuthUser(req)
      if (!user || message.user_id.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' })
      }

      return res.status(200).json({ success: true, message })
    } catch (error) {
      console.error('Error fetching message:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'PUT') {
    try {
      const user = await getAuthUser(req)
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const { is_read } = req.body

      const message = await Message.findByIdAndUpdate(id, { is_read }, { new: true })

      if (!message) {
        return res.status(404).json({ message: 'Message not found' })
      }

      if (message.user_id.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' })
      }

      return res.status(200).json({ success: true, message })
    } catch (error) {
      console.error('Error updating message:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
