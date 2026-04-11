// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import User from '@/lib/models/User'
import Job from '@/lib/models/Job'
import jwt from 'jsonwebtoken'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const getSingleValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] || ''
  }
  return value || ''
}

const makeUploadDir = async () => {
  const folder = path.join(process.cwd(), 'public', 'uploads', 'applications', `${Date.now()}`)
  await fs.promises.mkdir(folder, { recursive: true })
  return folder
}

const saveFile = async (file: formidable.File, uploadDir: string) => {
  if (!file || !file.filepath) {
    return null
  }

  const originalName = file.originalFilename || path.basename(file.filepath)
  const safeName = `${Date.now()}-${originalName.replace(/\s+/g, '_')}`
  const destination = path.join(uploadDir, safeName)

  await fs.promises.rename(file.filepath, destination)
  return `/uploads/applications/${path.basename(uploadDir)}/${safeName}`
}

const getAuthUser = async (req: NextApiRequest) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '')
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
      const user = await getAuthUser(req)
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      let applications
      if (user.role === 'admin') {
        // Admin sees all applications
        applications = await Application.find()
          .populate('user_id', 'name email phone')
          .populate('job_id', 'title description')
          .sort({ created_at: -1 })
      } else {
        // User sees only their applications
        applications = await Application.find({ user_id: user._id })
          .populate('job_id', 'title description')
          .sort({ created_at: -1 })
      }

      return res.status(200).json({ success: true, applications })
    } catch (error) {
      console.error('Error fetching applications:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    console.log("USER:", await getAuthUser(req));
    console.log("BODY:", req.body);

    const form = formidable({ multiples: true, keepExtensions: true })

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing application form:', err)
        return res.status(500).json({ message: 'Error parsing form data' })
      }

      try {
        const user = await getAuthUser(req)
        if (!user) {
          return res.status(401).json({ message: 'Unauthorized' })
        }

        const jobId = getSingleValue(fields.jobId)

        if (!jobId) {
          return res.status(400).json({ message: 'Job ID required' })
        }

        // Check if user already applied to this job
        const existingApplication = await Application.findOne({
          user_id: user._id,
          job_id: jobId,
        })

        if (existingApplication) {
          return res.status(400).json({ message: 'Already applied for this job' })
        }

        // Verify job exists
        const job = await Job.findById(jobId)
        if (!job) {
          return res.status(404).json({ message: 'Job not found' })
        }

        const uploadDir = await makeUploadDir()

        // Upload files
        const passportFile = files.passport as formidable.File | formidable.File[] | undefined
        const cvFile = files.cv as formidable.File | formidable.File[] | undefined

        const passportPath = Array.isArray(passportFile)
          ? await saveFile(passportFile[0], uploadDir)
          : passportFile
          ? await saveFile(passportFile, uploadDir)
          : null

        const cvPath = Array.isArray(cvFile)
          ? await saveFile(cvFile[0], uploadDir)
          : cvFile
          ? await saveFile(cvFile, uploadDir)
          : null

        if (!passportPath || !cvPath) {
          return res.status(400).json({ message: 'Passport and CV are required' })
        }

        // Create application
        const application = new Application({
          user_id: user._id,
          job_id: jobId,
          national_id: nationalId,
          phone,
          passport_path: passportPath,
          cv_path: cvPath,
          status: 'pending',
        })

        await application.save()

        // Update user has_submitted
        await User.findByIdAndUpdate(user._id, { has_submitted: true })

        return res.status(201).json({
          success: true,
          application,
        })
      } catch (error: any) {
        console.error('Error creating application:', error)
        return res.status(500).json({ message: 'Internal server error' })
      }
    })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
