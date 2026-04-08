/**
 * Central audit logging utility
 * Handles all audit log creation and suspicious activity detection
 */

import AuditLog from '@/lib/models/AuditLog'
import User from '@/lib/models/User'
import { getClientIp, detectDevice } from '@/lib/auditLogger'

export interface LogActivityOptions {
  user_id?: string
  action: 'REGISTER' | 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'ACTION'
  request: any
  details?: Record<string, any>
}

/**
 * Detect suspicious activity based on recent logins
 * Rules:
 * - Multiple logins from different IPs within short time window
 * - Rapid login attempts (brute force detection)
 */
const checkSuspiciousActivity = async (
  user_id: string | undefined,
  action: string,
  ip_address: string
): Promise<boolean> => {
  if (!user_id || action !== 'LOGIN') return false

  try {
    // Get last 5 logins for this user in the last 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const recentLogins = await AuditLog.find({
      user_id,
      action: 'LOGIN',
      created_at: { $gte: oneHourAgo },
    })
      .sort({ created_at: -1 })
      .limit(5)

    // Check for logins from multiple IPs in short time
    const uniqueIps = new Set(recentLogins.map(log => log.ip_address))
    if (uniqueIps.size > 2) {
      // More than 2 different IPs in last hour
      return true
    }

    // Check for rapid login attempts (more than 3 in 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const veryRecentLogins = await AuditLog.countDocuments({
      user_id,
      action: 'LOGIN',
      created_at: { $gte: fiveMinutesAgo },
    })

    if (veryRecentLogins > 3) {
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking suspicious activity:', error)
    return false
  }
}

/**
 * Main logging function - call this from all auth endpoints
 */
export const logActivity = async (options: LogActivityOptions): Promise<any> => {
  try {
    const { user_id, action, request, details = {} } = options

    const ip_address = getClientIp(request)
    const user_agent = request.headers['user-agent'] || 'Unknown'
    const { browser, device_type, os } = detectDevice(user_agent)

    // Check for suspicious activity
    const is_suspicious = await checkSuspiciousActivity(user_id, action, ip_address)

    // Create audit log
    const auditLog = new AuditLog({
      user_id: user_id || null,
      action,
      ip_address,
      user_agent,
      browser,
      device_type,
      os,
      is_suspicious,
      details,
    })

    await auditLog.save()

    // Populate user data for real-time events
    let userDetails = null
    if (user_id) {
      userDetails = await User.findById(user_id).select('name email role')
    }

    return {
      auditLog,
      user: userDetails,
      is_suspicious,
    }
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw - we don't want logging failures to break auth flow
    return null
  }
}

/**
 * Get suspicious activity count for a user
 */
export const getSuspiciousActivityCount = async (
  user_id: string,
  hoursBack: number = 24
): Promise<number> => {
  try {
    const dateThreshold = new Date(Date.now() - hoursBack * 60 * 60 * 1000)

    return await AuditLog.countDocuments({
      user_id,
      is_suspicious: true,
      created_at: { $gte: dateThreshold },
    })
  } catch (error) {
    console.error('Error getting suspicious activity count:', error)
    return 0
  }
}

/**
 * Get all logins for a user in a time range
 */
export const getUserLoginHistory = async (
  user_id: string,
  hoursBack: number = 24
): Promise<any[]> => {
  try {
    const dateThreshold = new Date(Date.now() - hoursBack * 60 * 60 * 1000)

    return await AuditLog.find({
      user_id,
      action: 'LOGIN',
      created_at: { $gte: dateThreshold },
    })
      .sort({ created_at: -1 })
      .lean()
  } catch (error) {
    console.error('Error getting user login history:', error)
    return []
  }
}
