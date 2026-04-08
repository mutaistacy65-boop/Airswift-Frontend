import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import EmailTemplate from '@/lib/models/EmailTemplate'
import User from '@/lib/models/User'
import jwt from 'jsonwebtoken'
import { DEFAULT_EMAIL_TEMPLATES } from '@/data/emailTemplates'

const getAuthUser = async (req: NextApiRequest) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const user = await User.findById(decoded.userId)
    return user
  } catch (error) {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB()

  if (req.method === 'GET') {
    try {
      const templates = await EmailTemplate.find().sort({ created_at: -1 })

      if (!templates || templates.length === 0) {
        // Seed with default templates
        await EmailTemplate.insertMany(DEFAULT_EMAIL_TEMPLATES)
        const seededTemplates = await EmailTemplate.find().sort({ created_at: -1 })
        return res.status(200).json({ success: true, templates: seededTemplates })
      }

      return res.status(200).json({ success: true, templates })
    } catch (error: any) {
      console.error('Error fetching email templates:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const user = await getAuthUser(req)
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can create templates' })
      }

      const { name, subject, body, variables } = req.body

      if (!name || !subject || !body) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      // Check if template with this name already exists
      const existingTemplate = await EmailTemplate.findOne({ name })
      if (existingTemplate) {
        return res.status(400).json({ message: 'Template with this name already exists' })
      }

      const template = new EmailTemplate({
        name,
        subject,
        body,
        variables: variables || [],
      })

      await template.save()

      return res.status(201).json({ success: true, template })
    } catch (error) {
      console.error('Error creating template:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
}