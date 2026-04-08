// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/adminMiddleware'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()
    const db = mongoose.connection.db

    // Total Applications
    const totalApplications = await db.collection('applications').countDocuments()

    // Active Jobs
    const activeJobs = await db.collection('jobs').countDocuments({ status: 'active' })

    // Conversion Rate: (Hires / Applications) × 100
    const hires = await db.collection('applications').countDocuments({ status: { $in: ['Hired', 'hired', 'HIRED'] } })
    const conversionRate = totalApplications > 0 ? Number(((hires / totalApplications) * 100).toFixed(1)) : 0

    // Avg. Time to Hire: average(hire_date - application_date or job_post_date)
    const hiredApps = await db.collection('applications').find({ status: { $in: ['Hired', 'hired', 'HIRED'] } }).toArray()
    let totalDays = 0
    let hireCount = 0
    for (const app of hiredApps) {
      const hireDate = new Date(app.updated_at || app.created_at)
      const appDate = new Date(app.created_at)
      const days = Math.ceil((hireDate.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24))
      if (days > 0) {
        totalDays += days
        hireCount++
      }
    }
    const avgTimeToHire = hireCount > 0 ? Math.round(totalDays / hireCount) : 0

    // Growth percentages (simplified: compare with last month)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())

    const currentMonthApps = await db.collection('applications').countDocuments({ created_at: { $gte: lastMonth } })
    const prevMonthApps = await db.collection('applications').countDocuments({ created_at: { $gte: prevMonth, $lt: lastMonth } })
    const applicationsGrowth = prevMonthApps > 0 ? Number((((currentMonthApps - prevMonthApps) / prevMonthApps) * 100).toFixed(1)) : 0

    const currentMonthJobs = await db.collection('jobs').countDocuments({ created_at: { $gte: lastMonth } })
    const prevMonthJobs = await db.collection('jobs').countDocuments({ created_at: { $gte: prevMonth, $lt: lastMonth } })
    const jobsGrowth = prevMonthJobs > 0 ? Number((((currentMonthJobs - prevMonthJobs) / prevMonthJobs) * 100).toFixed(1)) : 0

    // For conversion and time to hire, simplified growth
    const conversionGrowth = 5 // placeholder
    const timeToHireGrowth = 1 // placeholder

    return res.status(200).json({
      totalApplications,
      activeJobs,
      conversionRate,
      avgTimeToHire,
      growth: {
        applications: applicationsGrowth,
        jobs: jobsGrowth,
        conversion: conversionGrowth,
        timeToHire: timeToHireGrowth
      }
    })
  } catch (error: any) {
    console.error('Error fetching admin dashboard summary:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export default requireAdmin(handler)