// @ts-nocheck
/**
 * Email Monitoring and Logging Service
 * Tracks email sends, failures, and provides insights for debugging
 */

interface EmailLog {
  id: string
  timestamp: Date
  recipient: string
  subject: string
  status: 'sent' | 'failed' | 'pending'
  error?: string
  retries: number
  messageId?: string
}

class EmailLogger {
  private logs: EmailLog[] = []
  private maxLogs = 1000 // Keep last 1000 logs in memory

  /**
   * Log a sent email
   */
  logSent(recipient: string, subject: string, messageId?: string) {
    const log: EmailLog = {
      id: this.generateId(),
      timestamp: new Date(),
      recipient,
      subject,
      status: 'sent',
      retries: 0,
      messageId,
    }

    this.logs.push(log)
    this.maintainLogSize()

    console.log(`📧 [EMAIL_LOG] Sent to: ${recipient} | Subject: ${subject} | ID: ${log.id}`)
    return log.id
  }

  /**
   * Log a failed email
   */
  logFailed(recipient: string, subject: string, error: Error | string, retries = 0) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    const log: EmailLog = {
      id: this.generateId(),
      timestamp: new Date(),
      recipient,
      subject,
      status: 'failed',
      error: errorMessage,
      retries,
    }

    this.logs.push(log)
    this.maintainLogSize()

    console.error(
      `❌ [EMAIL_FAILED] To: ${recipient} | Subject: ${subject} | Error: ${errorMessage} | Retries: ${retries} | ID: ${log.id}`
    )

    // Send alert if repeated failures
    if (retries > 2) {
      this.alertRepeatedFailures(recipient, subject, retries)
    }

    return log.id
  }

  /**
   * Get email statistics
   */
  getStats() {
    const total = this.logs.length
    const sent = this.logs.filter((l) => l.status === 'sent').length
    const failed = this.logs.filter((l) => l.status === 'failed').length
    const successRate = total > 0 ? ((sent / total) * 100).toFixed(2) : '0.00'

    return {
      total,
      sent,
      failed,
      successRate: `${successRate}%`,
      lastLog: this.logs[this.logs.length - 1],
    }
  }

  /**
   * Get recent failures for debugging
   */
  getRecentFailures(limit = 10) {
    return this.logs
      .filter((l) => l.status === 'failed')
      .slice(-limit)
      .reverse()
  }

  /**
   * Get failures for a specific recipient
   */
  getFailuresForRecipient(recipient: string) {
    return this.logs.filter((l) => l.status === 'failed' && l.recipient === recipient)
  }

  /**
   * Clear old logs
   */
  private maintainLogSize() {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
  }

  /**
   * Generate unique ID
   */
  private generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Alert on repeated failures
   */
  private alertRepeatedFailures(recipient: string, subject: string, retries: number) {
    console.warn(
      `⚠️ [EMAIL_ALERT] Repeated failures - To: ${recipient} | Subject: ${subject} | Retries: ${retries}`
    )

    // In production, you might send this to a monitoring service like Sentry
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        `Production Alert: Email delivery issues detected for ${recipient}. This should be investigated.`
      )
    }
  }

  /**
   * Export logs for analysis
   */
  exportLogs() {
    return {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      recentFailures: this.getRecentFailures(20),
      allLogs: this.logs,
    }
  }
}

// Singleton instance
export const emailLogger = new EmailLogger()

/**
 * Helper to log email operations
 */
export const logEmailOperation = (operation: 'send' | 'fail' | 'retry', details: any) => {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] EMAIL_${operation.toUpperCase()}: ${JSON.stringify(details)}`

  switch (operation) {
    case 'send':
      console.log(`✅ ${logMessage}`)
      break
    case 'fail':
      console.error(`❌ ${logMessage}`)
      break
    case 'retry':
      console.warn(`🔄 ${logMessage}`)
      break
  }
}
