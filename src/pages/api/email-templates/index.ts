import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import { DEFAULT_EMAIL_TEMPLATES } from '@/data/emailTemplates'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { db } = await connectToDatabase()
    const templates = await db.collection('emailTemplates').find({}).toArray()

    if (!templates || templates.length === 0) {
      // Seed with default templates
      await db.collection('emailTemplates').insertMany(DEFAULT_EMAIL_TEMPLATES)
      return res.status(200).json(DEFAULT_EMAIL_TEMPLATES)
    }

    return res.status(200).json(templates)
  } catch (error: any) {
    console.error('Error fetching email templates:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}