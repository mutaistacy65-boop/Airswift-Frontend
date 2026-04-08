import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import AuditLog from '@/lib/models/AuditLog'
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

  // Only admins can access audit logs
  const user = await getAuthUser(req)
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' })
  }

  if (req.method === 'GET') {
    try {
      const {
        page = '1',
        limit = '20',
        action,
        userId,
        ipAddress,
        searchUser,
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

      // Filter by user ID
      if (userId) {
        filters.user_id = userId
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
      console.error('Error fetching audit logs:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    // Export logs
    try {
      const { action, startDate, endDate, format = 'json' } = req.body

      const filters: Record<string, any> = {}

      if (action) {
        filters.action = action
      }

      const dateFilters: Record<string, any> = {}
      if (startDate) {
        dateFilters.$gte = new Date(startDate)
      }
      if (endDate) {
        const endDateObj = new Date(endDate)
        endDateObj.setHours(23, 59, 59, 999)
        dateFilters.$lte = endDateObj
      }

      if (Object.keys(dateFilters).length > 0) {
        filters.created_at = dateFilters
      }

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
      ])

      if (format === 'csv') {
        // Return CSV format
        const csv = generateCSV(logs)
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"')
        return res.status(200).send(csv)
      }

      return res.status(200).json({
        success: true,
        logs,
        count: logs.length,
        format: 'json',
      })
    } catch (error: any) {
      console.error('Error exporting audit logs:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
}

/**
 * Generate CSV from audit logs
 */
function generateCSV(logs: any[]): string {
  const headers = ['Date', 'User', 'Email', 'Action', 'IP Address', 'Browser', 'Device', 'OS', 'Suspicious']
  const rows = logs.map(log => [
    new Date(log.created_at).toISOString(),
    log.user_details?.name || 'Unknown',
    log.user_details?.email || 'N/A',
    log.action,
    log.ip_address,
    log.browser,
    log.device_type,
    log.os,
    log.is_suspicious ? 'Yes' : 'No',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  return csvContent
}
