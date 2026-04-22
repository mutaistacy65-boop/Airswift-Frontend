// @ts-nocheck
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

  if (req.method === 'GET') {
    try {
      const user = await getAuthUser(req)
      
      // Check if user is admin
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' })
      }

      // Parse query parameters for filtering and pagination
      const {
        page = 1,
        limit = 20,
        action,
        searchUser,
        ipAddress,
        startDate,
        endDate,
        suspicious,
      } = req.query

      // Build filter object
      const filter: any = {}

      // Filter by action
      if (action && action !== 'ALL') {
        filter.action = action
      }

      // Filter by suspicious flag
      if (suspicious === 'true') {
        filter.is_suspicious = true
      }

      // Filter by IP address
      if (ipAddress) {
        filter.ip_address = { $regex: ipAddress, $options: 'i' }
      }

      // Filter by user (name or email)
      if (searchUser) {
        const searchRegex = { $regex: searchUser, $options: 'i' }
        
        // Find users matching the search
        const matchingUsers = await User.find({
          $or: [
            { name: searchRegex },
            { email: searchRegex }
          ]
        }).select('_id')

        const userIds = matchingUsers.map(u => u._id)
        if (userIds.length > 0) {
          filter.user_id = { $in: userIds }
        } else {
          // No users found, return empty results
          return res.status(200).json({
            success: true,
            logs: [],
            pagination: {
              page: 1,
              limit: parseInt(limit as string),
              total: 0,
              pages: 0,
            },
          })
        }
      }

      // Filter by date range
      if (startDate || endDate) {
        filter.created_at = {}
        if (startDate) {
          filter.created_at.$gte = new Date(startDate as string)
        }
        if (endDate) {
          // Add 1 day to include the entire end date
          const endDateTime = new Date(endDate as string)
          endDateTime.setDate(endDateTime.getDate() + 1)
          filter.created_at.$lt = endDateTime
        }
      }

      // Calculate pagination
      const pageNum = Math.max(1, parseInt(page as string) || 1)
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20))
      const skip = (pageNum - 1) * limitNum

      // Get total count for pagination
      const total = await AuditLog.countDocuments(filter)
      const pages = Math.ceil(total / limitNum)

      // Fetch logs with user information
      const logs = await AuditLog.find(filter)
        .populate('user_id', 'name email role _id')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()

      // Transform logs to include user info at top level
      const transformedLogs = logs.map(log => ({
        ...log,
        user_name: (log.user_id as any)?.name || 'Unknown',
        user_email: (log.user_id as any)?.email || 'Unknown',
        user_role: (log.user_id as any)?.role || 'unknown',
      }))

      return res.status(200).json({
        success: true,
        logs: transformedLogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages,
        },
      })
    } catch (error: any) {
      console.error('Error fetching audit logs:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch audit logs',
        error: error.message,
      })
    }
  } else if (req.method === 'POST') {
    try {
      const user = await getAuthUser(req)
      
      // Check if user is admin
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' })
      }

      const { action, startDate, endDate, format = 'json' } = req.body

      // Build filter
      const filter: any = {}
      if (action && action !== 'ALL') {
        filter.action = action
      }
      if (startDate || endDate) {
        filter.created_at = {}
        if (startDate) {
          filter.created_at.$gte = new Date(startDate)
        }
        if (endDate) {
          const endDateTime = new Date(endDate)
          endDateTime.setDate(endDateTime.getDate() + 1)
          filter.created_at.$lt = endDateTime
        }
      }

      // Fetch all matching logs
      const logs = await AuditLog.find(filter)
        .populate('user_id', 'name email role')
        .sort({ created_at: -1 })
        .lean()

      if (format === 'csv') {
        // Generate CSV
        const csvHeader = 'timestamp,user,email,action,ip_address,browser,device,os,status\n'
        const csvRows = logs
          .map(log => {
            const user = (log.user_id as any) || {}
            const timestamp = new Date(log.created_at).toISOString()
            const status = log.is_suspicious ? 'SUSPICIOUS' : 'NORMAL'
            return `"${timestamp}","${user.name || 'Unknown'}","${user.email || 'Unknown'}","${log.action}","${log.ip_address}","${log.browser || 'N/A'}","${log.device_type || 'N/A'}","${log.os || 'N/A'}","${status}"`
          })
          .join('\n')

        const csv = csvHeader + csvRows
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`)
        return res.status(200).send(csv)
      } else {
        // Return JSON
        return res.status(200).json({
          success: true,
          data: logs.map(log => ({
            ...log,
            user_name: (log.user_id as any)?.name || 'Unknown',
            user_email: (log.user_id as any)?.email || 'Unknown',
            user_role: (log.user_id as any)?.role || 'unknown',
          })),
        })
      }
    } catch (error: any) {
      console.error('Error exporting audit logs:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to export audit logs',
        error: error.message,
      })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ success: false, message: 'Method Not Allowed' })
  }
}
