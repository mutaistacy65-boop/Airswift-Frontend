// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import jwt from 'jsonwebtoken'

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'change_me'

const verifyToken = (req: NextApiRequest) => {
  return new Promise((resolve, reject) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.accessToken

    if (!token) {
      reject(new Error('No token provided'))
      return
    }

    jwt.verify(token, JWT_ACCESS_SECRET, (err: any, decoded: any) => {
      if (err) {
        reject(new Error('Invalid token'))
        return
      }

      resolve({
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role,
      })
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB()

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Verify admin access
    let user
    try {
      user = await verifyToken(req)
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (!user || (user as any).role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" })
    }

    const { id } = req.query
    const { notes } = req.body

    if (!id) {
      return res.status(400).json({ message: 'Application ID is required' })
    }

    // Update application notes
    const application = await Application.findByIdAndUpdate(
      id,
      { notes },
      { new: true }
    ).populate('user_id', 'name email')
     .populate('job_id', 'title')

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    return res.status(200).json({
      success: true,
      application,
      message: 'Notes updated successfully'
    })

  } catch (error) {
    console.error('Error updating application notes:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}