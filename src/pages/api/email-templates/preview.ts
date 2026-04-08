// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { DEFAULT_EMAIL_TEMPLATES } from '@/data/emailTemplates'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { templateId, variables } = req.body

  if (!templateId) {
    return res.status(400).json({ message: 'templateId is required' })
  }

  try {
    // Get template from database or use default
    await connectDB()
    const db = mongoose.connection.db
    let template = await db.collection('emailTemplates').findOne({ id: templateId })

    if (!template) {
      template = DEFAULT_EMAIL_TEMPLATES.find(t => t.id === templateId) as any;
    }

    if (!template) {
      return res.status(404).json({ message: 'Email template not found' })
    }

    // Replace variables in subject and body
    let subject = template.subject
    let body = template.body

    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        subject = subject.replace(regex, value)
        body = body.replace(regex, value)
      })
    }

    return res.status(200).json({ subject, body })
  } catch (error: any) {
    console.error('Error previewing email template:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}