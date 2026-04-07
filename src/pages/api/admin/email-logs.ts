import type { NextApiRequest, NextApiResponse } from 'next'
import { emailLogger } from '@/lib/emailLogger'
import { verifyToken } from '@/lib/authController'

/**
 * Admin-only endpoint to view email logs and statistics
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify user is authenticated and is admin
  try {
    const decoded: any = await verifyToken(req)

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const { type, recipient, limit } = req.query

    try {
      if (type === 'stats') {
        return res.status(200).json(emailLogger.getStats())
      }

      if (type === 'recent-failures') {
        const recentFailures = emailLogger.getRecentFailures(limit ? parseInt(limit as string) : 10)
        return res.status(200).json({
          count: recentFailures.length,
          failures: recentFailures,
        })
      }

      if (type === 'recipient' && recipient) {
        const failures = emailLogger.getFailuresForRecipient(recipient as string)
        return res.status(200).json({
          recipient,
          failureCount: failures.length,
          failures,
        })
      }

      if (type === 'export') {
        return res.status(200).json(emailLogger.exportLogs())
      }

      // Default - return stats
      return res.status(200).json(emailLogger.getStats())
    } catch (error: any) {
      return res.status(500).json({
        message: 'Error retrieving email logs',
        error: error.message,
      })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
