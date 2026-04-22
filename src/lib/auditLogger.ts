// @ts-nocheck
/**
 * Device detection utilities
 * Extracts browser, OS, and device type from user agent
 */

export interface DeviceInfo {
  browser: string
  device_type: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown'
  os: string
}

export const detectDevice = (userAgent: string): DeviceInfo => {
  const ua = userAgent.toLowerCase()

  // Detect OS
  let os = 'Unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac') || ua.includes('iphone') || ua.includes('ipad'))
    os = 'macOS/iOS'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('x11')) os = 'Unix'

  // Detect Browser
  let browser = 'Unknown'
  if (ua.includes('edg/')) browser = 'Edge'
  else if (ua.includes('firefox/')) browser = 'Firefox'
  else if (ua.includes('chrome/') && !ua.includes('chromium')) browser = 'Chrome'
  else if (ua.includes('safari/') && !ua.includes('chrome')) browser = 'Safari'
  else if (ua.includes('opr/') || ua.includes('opera/')) browser = 'Opera'
  else if (ua.includes('trident/')) browser = 'IE'
  else if (ua.includes('ucbrowser')) browser = 'UC Browser'
  else if (ua.includes('samsung')) browser = 'Samsung Internet'

  // Detect Device Type
  let device_type: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown' = 'Unknown'
  if (
    ua.includes('iphone') ||
    ua.includes('android') ||
    ua.includes('mobile') ||
    ua.includes('blackberry') ||
    ua.includes('windows phone')
  ) {
    device_type = ua.includes('tablet') || ua.includes('ipad') ? 'Tablet' : 'Mobile'
  } else if (ua.includes('ipad') || ua.includes('tablet')) {
    device_type = 'Tablet'
  } else if (
    ua.includes('windows') ||
    ua.includes('macintosh') ||
    ua.includes('linux') ||
    ua.includes('x11')
  ) {
    device_type = 'Desktop'
  }

  return {
    browser,
    device_type,
    os,
  }
}

/**
 * Simple IP extraction (works in most cases)
 * Note: Behind proxies, check X-Forwarded-For first
 */
export const getClientIp = (req: any): string => {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    // If multiple IPs in forwarded header, get the first one
    return typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : forwarded[0].trim()
  }

  return req.headers['x-real-ip'] || req.socket.remoteAddress || 'Unknown'
}

/**
 * Extract version from user agent (optional for detailed tracking)
 */
export const getBrowserVersion = (userAgent: string): string => {
  const ua = userAgent.toLowerCase()

  if (ua.includes('edg/')) {
    const match = ua.match(/edg\/(\d+)/)
    return match ? match[1] : 'Unknown'
  }
  if (ua.includes('firefox/')) {
    const match = ua.match(/firefox\/(\d+)/)
    return match ? match[1] : 'Unknown'
  }
  if (ua.includes('chrome/')) {
    const match = ua.match(/chrome\/(\d+)/)
    return match ? match[1] : 'Unknown'
  }
  if (ua.includes('safari/')) {
    const match = ua.match(/version\/(\d+)/)
    return match ? match[1] : 'Unknown'
  }

  return 'Unknown'
}
