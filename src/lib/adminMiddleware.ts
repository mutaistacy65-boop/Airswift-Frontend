import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'

const JWT_SECRET = process.env.JWT_SECRET || 'change_me'

export interface AuthTokenPayload {
  id: string
  email: string
  role: string
  iat: number
  exp: number
}

export const requireAdmin = (
  handler: (req: NextApiRequest & { user?: AuthTokenPayload }, res: NextApiResponse) => void | Promise<void>,
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const cookies = cookie.parse(req.headers.cookie || '')
    const token = cookies.token

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload

      if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' })
      }

      ;(req as any).user = decoded
      return handler(req as NextApiRequest & { user: AuthTokenPayload }, res)
    } catch (error) {
      console.error('Admin authentication failed:', error)
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
  }
}
