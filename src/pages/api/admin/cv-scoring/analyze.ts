import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { verifyToken } from '@/lib/authController'
import { ObjectId } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify admin authentication
  let decoded: any = null
  try {
    decoded = await verifyToken(req)
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  await connectDB()
  const db = mongoose.connection.db

  try {
    const { applicationId } = req.body

    if (!applicationId) {
      return res.status(400).json({ message: 'Application ID is required' })
    }

    // Get application with CV
    const application = await db.collection('applications').findOne({ _id: new ObjectId(applicationId) })

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    if (!application.documents?.cv) {
      return res.status(400).json({ message: 'CV document not found' })
    }

    // Get job details for matching
    let jobDetails = null
    if (application.jobId) {
      jobDetails = await db.collection('jobs').findOne({ _id: new ObjectId(application.jobId) })
    }

    // Simulate AI analysis (in production, this would call OpenAI API)
    const aiAnalysis = await performAICVAnalysis(application, jobDetails)

    // Update application with AI analysis results
    await db.collection('applications').updateOne(
      { _id: new ObjectId(applicationId) },
      {
        $set: {
          aiScore: aiAnalysis.score,
          aiAnalysis: aiAnalysis,
          updatedAt: new Date()
        }
      }
    )

    return res.status(200).json({
      success: true,
      analysis: aiAnalysis
    })

  } catch (error) {
    console.error('Error performing AI CV analysis:', error)
    return res.status(500).json({ message: 'Failed to analyze CV' })
  }
}

// Simulated AI CV analysis function
async function performAICVAnalysis(application: any, job: any) {
  // In production, this would use OpenAI API to analyze the CV
  // For now, we'll simulate analysis based on available data

  let score = 50 // Base score
  const skills: string[] = []
  const analysis: any = {
    score: 0,
    skills: [],
    experience: 'Entry level',
    education: 'Not specified',
    strengths: [],
    weaknesses: [],
    recommendations: [],
    jobMatch: 0
  }

  // Extract skills from job requirements and match with user profile
  if (job?.requirements && Array.isArray(job.requirements)) {
    const jobSkills = job.requirements.map((req: string) => req.toLowerCase())

    // Simulate skill extraction (in production, this would be AI-powered)
    const commonSkills = ['javascript', 'react', 'node.js', 'python', 'java', 'communication', 'teamwork']
    const matchedSkills = commonSkills.filter(skill =>
      jobSkills.some((jobSkill: string) => jobSkill.includes(skill))
    )

    skills.push(...matchedSkills)
    score += matchedSkills.length * 10
  }

  // Experience analysis
  if (application.experience) {
    if (application.experience > 5) {
      score += 20
      analysis.experience = 'Senior level'
    } else if (application.experience > 2) {
      score += 10
      analysis.experience = 'Mid level'
    }
  }

  // Job matching score
  if (job) {
    let matchScore = 0
    if (application.location === job.location) matchScore += 20
    if (skills.length > 0) matchScore += 30
    if (application.experience > 0) matchScore += 20

    analysis.jobMatch = Math.min(matchScore, 100)
    score += matchScore * 0.3 // Add 30% of match score to total
  }

  // Ensure score doesn't exceed 100
  score = Math.min(Math.max(score, 0), 100)

  analysis.score = Math.round(score)
  analysis.skills = skills
  analysis.strengths = [
    skills.length > 0 ? `Strong in ${skills.slice(0, 3).join(', ')}` : 'Good general skills',
    analysis.experience !== 'Entry level' ? `${analysis.experience} experience` : 'Eager to learn'
  ]
  analysis.weaknesses = [
    skills.length < 3 ? 'Could develop more technical skills' : null,
    !application.experience ? 'Limited work experience' : null
  ].filter(Boolean)

  analysis.recommendations = [
    'Consider gaining more experience in the field',
    'Focus on developing key technical skills',
    'Network with professionals in the industry'
  ]

  return analysis
}