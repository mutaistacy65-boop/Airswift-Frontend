import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

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

const calculateAIScore = (user: any, job: any) => {
  let score = 0

  if (Array.isArray(job?.skills) && Array.isArray(user?.skills)) {
    const matchedSkills = job.skills.filter((skill: string) => user.skills.includes(skill)).length
    score += matchedSkills * 15
  }

  if (user?.experience && job?.requiredExperience) {
    const candidateExperience = Number(user.experience)
    const requiredExperience = Number(job.requiredExperience)
    if (!Number.isNaN(candidateExperience) && !Number.isNaN(requiredExperience) && candidateExperience >= requiredExperience) {
      score += 20
    }
  }

  if (user?.location && job?.location && user.location === job.location) {
    score += 10
  }

  if (score === 0) {
    score = Math.floor(Math.random() * 30) + 60
  }

  return Math.min(score, 100)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const form = formidable({ multiples: true, keepExtensions: true })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing application form:', err)
      return res.status(500).json({ message: 'Error parsing form data' })
    }

    try {
      const jobId = getSingleValue(fields.jobId)
      const coverLetter = getSingleValue(fields.coverLetter)
      const jobCategory = getSingleValue(fields.jobCategory)
      const userId = getSingleValue(fields.userId)
      const applicantName = getSingleValue(fields.userName)
      const applicantEmail = getSingleValue(fields.userEmail)
      const applicantPhone = getSingleValue(fields.userPhone)
      const notes = getSingleValue(fields.notes)

      if (!jobId || !userId) {
        return res.status(400).json({ message: 'Job ID and user ID are required' })
      }

      await connectDB()
      const db = mongoose.connection.db

      const existing = await db.collection('applications').findOne({ userId, jobId })
      if (existing) {
        return res.status(400).json({ message: 'Already applied for this job' })
      }

      let job = null
      try {
        job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) })
      } catch {
        job = null
      }

      const uploadDir = await makeUploadDir()
      const passportFile = files.passport as formidable.File | formidable.File[] | undefined
      const nationalIdFile = files.nationalId as formidable.File | formidable.File[] | undefined
      const cvFile = files.cv as formidable.File | formidable.File[] | undefined
      const certificatesFiles = files.certificates

      const passportPath = Array.isArray(passportFile)
        ? await saveFile(passportFile[0], uploadDir)
        : passportFile
        ? await saveFile(passportFile, uploadDir)
        : null

      const nationalIdPath = Array.isArray(nationalIdFile)
        ? await saveFile(nationalIdFile[0], uploadDir)
        : nationalIdFile
        ? await saveFile(nationalIdFile, uploadDir)
        : null

      const cvPath = Array.isArray(cvFile)
        ? await saveFile(cvFile[0], uploadDir)
        : cvFile
        ? await saveFile(cvFile, uploadDir)
        : null

      const certificatePaths: string[] = []
      if (certificatesFiles) {
        const certificatesArray = Array.isArray(certificatesFiles) ? certificatesFiles : [certificatesFiles]
        for (const cert of certificatesArray) {
          const savedPath = await saveFile(cert as formidable.File, uploadDir)
          if (savedPath) certificatePaths.push(savedPath)
        }
      }

      const aiScore = calculateAIScore({
        skills: Array.isArray(fields.userSkills) ? fields.userSkills : [],
        experience: getSingleValue(fields.userExperience),
        location: getSingleValue(fields.userLocation),
      },
      job || {})

      const application = {
        userId,
        applicantName,
        applicantEmail,
        applicantPhone,
        jobId,
        jobTitle: job?.title || '',
        jobLocation: job?.location || '',
        coverLetter,
        jobCategory,
        documents: {
          passport: passportPath,
          nationalId: nationalIdPath,
          cv: cvPath,
          certificates: certificatePaths,
        },
        status: 'Submitted',
        aiScore,
        resumeSnapshot: cvPath || '',
        interviewId: null,
        notes: notes || '',
        appliedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection('applications').insertOne(application)

      return res.status(201).json({
        success: true,
        application: {
          ...application,
          id: result.insertedId.toString(),
        },
      })
    } catch (error: any) {
      console.error('Error creating application:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  })
}
