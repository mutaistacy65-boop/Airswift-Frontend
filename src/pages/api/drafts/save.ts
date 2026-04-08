// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import { verifyToken } from '@/lib/authController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await connectDB()
    const db = require('mongoose').connection.db

    const { formData } = req.body

    if (!formData) {
      return res.status(400).json({ message: 'Form data is required' })
    }

    // Save or update draft
    const result = await db.collection('drafts').findOneAndUpdate(
      { user_id: user.userId },
      {
        user_id: user.userId,
        form_data: formData,
        updated_at: new Date()
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )

    return res.status(200).json({
      success: true,
      draft: result.value
    })
  } catch (error: any) {
    console.error('Error saving draft:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}