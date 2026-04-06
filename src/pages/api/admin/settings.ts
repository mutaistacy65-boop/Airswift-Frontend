import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { verifyToken } from '@/lib/authController'

const defaultSettings = {
  platformName: 'Airswift',
  maxJobsPerDay: 50,
  maxApplicationsPerDay: 100,
  emailNotificationsEnabled: true,
  maintenanceMode: false,
  paymentProviderKey: '',
  defaultCurrency: 'USD',
  companyContactEmail: 'support@airswift.com',
  companyPhoneNumber: '+1-800-AIRSWIFT',
  termsAndConditionsUrl: '/terms',
  privacyPolicyUrl: '/privacy',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: '',
  openaiApiKey: '',
  africasTalkingUsername: '',
  africasTalkingApiKey: '',
  cloudinaryCloudName: '',
  cloudinaryApiKey: '',
  cloudinaryApiSecret: ''
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let decoded: any

  // Verify admin authentication
  try {
    decoded = await verifyToken(req)
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  await connectDB()
  const db = mongoose.connection.db

  switch (req.method) {
    case 'GET':
      try {
        // Try to get settings from database
        const settings = await db.collection('settings').findOne({})

        if (!settings) {
          // Return default settings if none exist
          return res.status(200).json(defaultSettings)
        }

        // Merge with defaults to ensure all fields exist
        const mergedSettings = { ...defaultSettings, ...settings }
        delete mergedSettings._id // Remove MongoDB _id from response

        return res.status(200).json(mergedSettings)
      } catch (error) {
        console.error('Error fetching settings:', error)
        return res.status(500).json({ message: 'Failed to fetch settings' })
      }

    case 'PUT':
      try {
        const updateData = req.body

        // Validate required fields
        if (!updateData.platformName || typeof updateData.platformName !== 'string') {
          return res.status(400).json({ message: 'Platform name is required and must be a string' })
        }

        // Update settings in database
        const result = await db.collection('settings').findOneAndUpdate(
          {}, // Empty filter to match any document (should only be one settings document)
          {
            $set: {
              ...updateData,
              updatedAt: new Date(),
              updatedBy: decoded.userId
            }
          },
          {
            upsert: true, // Create document if it doesn't exist
            returnDocument: 'after'
          }
        )

        const updatedSettings = result.value
        if (updatedSettings) {
          delete updatedSettings._id
        }

        return res.status(200).json(updatedSettings || updateData)
      } catch (error) {
        console.error('Error updating settings:', error)
        return res.status(500).json({ message: 'Failed to update settings' })
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}