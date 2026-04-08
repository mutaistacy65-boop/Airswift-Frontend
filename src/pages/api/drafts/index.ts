// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import { verifyToken } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await connectDB()
    const db = require('mongoose').connection.db

    const draft = await db.collection('drafts').findOne({ user_id: user.userId })

    return res.json({
      draft: draft || null
    })
  } catch (error: any) {
    console.error('Error loading draft:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}