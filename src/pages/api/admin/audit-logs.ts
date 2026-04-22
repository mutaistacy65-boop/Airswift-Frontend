// @ts-nocheck
/**
 * Admin Audit Logs Endpoint
 * Fetches audit logs for admin users with filtering and pagination
 * Routes through to the main audit-logs endpoint
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import AuditLog from '@/lib/models/AuditLog'
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

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: 'Method Not Allowed' })
  }

  try {
    // Verify admin access
    const user = await getAuthUser(req)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin access required.' 
      })
    }

    const {
      page = '1',
      limit = '20',
      action,
      entity,
      searchUser,
      ipAddress,
      startDate,
      endDate,
      suspicious,
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)))
    const skip = (pageNum - 1) * limitNum

    // Build filter query
    const filters: Record<string, any> = {}

    // Filter by action
    if (action && action !== 'ALL') {
      filters.action = action
    }

    // Filter by entity
    if (entity) {
      filters.entity = entity
    }

    // Filter by IP address
    if (ipAddress) {
      filters.ip_address = { $regex: ipAddress, $options: 'i' }
    }

    // Search by user name or email
    if (searchUser) {
      const searchRegex = { $regex: searchUser, $options: 'i' }
      const users = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id')

      const userIds = users.map(u => u._id)
      if (userIds.length > 0) {
        filters.$or = [
          { user_id: { $in: userIds } },
          { 'user_id.email': searchRegex },
          { 'user_id.name': searchRegex },
        ]
      }
    }

    // Filter by date range
    const dateFilters: Record<string, any> = {}
    if (startDate) {
      dateFilters.$gte = new Date(startDate as string)
    }
    if (endDate) {
      const endDateObj = new Date(endDate as string)
      endDateObj.setHours(23, 59, 59, 999)
      dateFilters.$lte = endDateObj
    }

    if (Object.keys(dateFilters).length > 0) {
      filters.created_at = dateFilters
    }

    // Filter suspicious activities
    if (suspicious === 'true') {
      filters.is_suspicious = true
    }

    // Get total count
    const total = await AuditLog.countDocuments(filters)

    // Fetch logs with user details
    const logs = await AuditLog.aggregate([
      { $match: filters },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user_details',
        },
      },
      { $unwind: { path: '$user_details', preserveNullAndEmptyArrays: true } },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          _id: 1,
          action: 1,
          entity: 1,
          entity_id: 1,
          ip_address: 1,
          browser: 1,
          device_type: 1,
          os: 1,
          is_suspicious: 1,
          created_at: 1,
          details: 1,
          user_name: '$user_details.name',
          user_email: '$user_details.email',
        },
      },
    ])

    return res.status(200).json({
      success: true,
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error: any) {
    console.error('Error fetching admin audit logs:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message 
    })
  }
}
