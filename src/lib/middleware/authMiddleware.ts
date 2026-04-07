import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

interface AuthRequest extends NextApiRequest {
  userId?: string
  userEmail?: string
  userRole?: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'change_me'

export const authMiddleware = (handler: any) => {
  return async (req: AuthRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]

      if (!token) {
        return res.status(401).json({ message: 'No authorization token provided' })
      }

      // Verify token
      const decoded: any = jwt.verify(token, JWT_SECRET)
      
      // Attach user info to request
      req.userId = decoded.id
      req.userEmail = decoded.email
      req.userRole = decoded.role

      // Call the actual handler
      return handler(req, res)
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired' })
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Invalid token' })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export type { AuthRequest }
