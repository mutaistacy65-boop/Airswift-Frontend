// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import User from '@/lib/models/User'
import Job from '@/lib/models/Job'
import jwt from 'jsonwebtoken'

const getAuthUser = async (req: NextApiRequest) => {
  try {
    // Prefer Authorization header over cookie to avoid stale admin cookie takeover.
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.accessToken
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

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const user = await getAuthUser(req)
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Only admins can access this endpoint
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    // Get all applications with pagination support
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await Application.countDocuments()
    console.log(`[Admin Applications] Total applications in DB: ${total}`)

    // Fetch applications with populated user and job details
    const applications = await Application.find()
      .populate('user_id', 'name email phone')
      .populate('job_id', 'title description')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)

    console.log(`[Admin Applications] Fetched ${applications.length} applications for page ${page}`)

    // Transform applications to include document URLs
    const transformedApplications = applications.map(app => ({
      ...app.toObject(),
      cvUrl: app.cv_path ? `${process.env.NEXT_PUBLIC_API_URL || ''}${app.cv_path}` : null,
      passportUrl: app.passport_path ? `${process.env.NEXT_PUBLIC_API_URL || ''}${app.passport_path}` : null,
    }))

    return res.status(200).json({
      success: true,
      applications: transformedApplications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching admin applications:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
