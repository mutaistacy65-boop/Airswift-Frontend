// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Application from '@/lib/models/Application'
import User from '@/lib/models/User'
import Job from '@/lib/models/Job'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
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
    // Prefer Authorization header over cookie to avoid stale admin cookie takeover.
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.accessToken
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
        return res.status(400).json({ message: `Form parsing error: ${err.message}` })
      }

      console.log('Form parsed successfully:', {
        fieldKeys: Object.keys(fields),
        fileKeys: Object.keys(files),
        hasPassport: Boolean(files.passport),
        hasCv: Boolean(files.cv),
      })

      try {
        const user = await getAuthUser(req)
        if (!user) {
          console.warn('Authentication failed: No user found')
          return res.status(401).json({ message: 'Unauthorized - please log in again' })
        }

        const jobId = getSingleValue(fields.jobId)

        if (!jobId) {
          return res.status(400).json({ message: 'Job title is required' })
        }

        let resolvedJob = null
        let jobObjectId: mongoose.Types.ObjectId | null = null

        if (mongoose.Types.ObjectId.isValid(jobId)) {
          jobObjectId = new mongoose.Types.ObjectId(jobId)
          resolvedJob = await Job.findById(jobObjectId)
        }

        if (!resolvedJob) {
          // Try matching by title if the user typed a job title
          resolvedJob = await Job.findOne({
            title: { $regex: new RegExp(`^${jobId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          })
        }

        if (!resolvedJob) {
          // Create a placeholder job record for the typed job title
          resolvedJob = await Job.create({
            title: jobId,
            description: `Application for ${jobId}`,
          })
        }

        const jobToSave = resolvedJob._id
        const nationalId = getSingleValue(fields.nationalId)
        const phone = getSingleValue(fields.phone)

        if (!nationalId || !phone) {
          return res.status(400).json({ message: 'National ID and phone are required' })
        }

        // Check if user already applied to this job
        const existingApplication = await Application.findOne({
          user_id: user._id,
          job_id: jobToSave,
        })

        if (existingApplication) {
          return res.status(400).json({ message: 'Already applied for this job' })
        }

        const uploadDir = await makeUploadDir()

        // Upload files
        const passportFile = files.passport as formidable.File | formidable.File[] | undefined
        const cvFile = files.cv as formidable.File | formidable.File[] | undefined

        try {
          var passportPath = Array.isArray(passportFile)
            ? await saveFile(passportFile[0], uploadDir)
            : passportFile
            ? await saveFile(passportFile, uploadDir)
            : null

          var cvPath = Array.isArray(cvFile)
            ? await saveFile(cvFile[0], uploadDir)
            : cvFile
            ? await saveFile(cvFile, uploadDir)
            : null
        } catch (fileError: any) {
          console.error('File upload error:', fileError)
          return res.status(400).json({ message: `File upload failed: ${fileError.message}` })
        }

        if (!passportPath || !cvPath) {
          console.warn('Missing required files:', { passportPath, cvPath })
          return res.status(400).json({ message: 'Passport and CV are required' })
        }

        // Create application
        const application = new Application({
          user_id: user._id,
          job_id: jobToSave,
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
        
        // Provide more specific error messages for debugging
        let errorMessage = 'Internal server error'
        
        if (error.code === 11000) {
          errorMessage = 'Duplicate application detected'
        } else if (error.message?.includes('Cast to ObjectId')) {
          errorMessage = 'Invalid job ID format'
        } else if (error.message?.includes('ENOSPC')) {
          errorMessage = 'Server storage full'
        } else if (error.message?.includes('EACCES')) {
          errorMessage = 'Server file permission error'
        }
        
        console.error('Detailed error:', {
          name: error.name,
          message: error.message,
          code: error.code,
          stack: error.stack,
        })
        
        return res.status(500).json({ message: errorMessage })
      }
    })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
