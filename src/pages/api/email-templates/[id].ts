import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import EmailTemplate from '@/lib/models/EmailTemplate'
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
    return res.status(400).json({ message: 'Invalid template ID' })
  }

  if (req.method === 'GET') {
    try {
      const template = await EmailTemplate.findById(id)

      if (!template) {
        return res.status(404).json({ message: 'Template not found' })
      }

      return res.status(200).json({ success: true, template })
    } catch (error) {
      console.error('Error fetching template:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'PUT') {
    try {
      const user = await getAuthUser(req)
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can update templates' })
      }

      const { subject, body, variables } = req.body

      const template = await EmailTemplate.findByIdAndUpdate(
        id,
        { subject, body, variables },
        { new: true }
      )

      if (!template) {
        return res.status(404).json({ message: 'Template not found' })
      }

      return res.status(200).json({ success: true, template })
    } catch (error) {
      console.error('Error updating template:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const user = await getAuthUser(req)
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can delete templates' })
      }

      const template = await EmailTemplate.findByIdAndDelete(id)

      if (!template) {
        return res.status(404).json({ message: 'Template not found' })
      }

      return res.status(200).json({ success: true, message: 'Template deleted' })
    } catch (error) {
      console.error('Error deleting template:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
