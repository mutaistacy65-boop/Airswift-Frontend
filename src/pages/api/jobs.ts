// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

type Job = {
  _id: string
  title: string
  location: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Job[] | { message: string }>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()
    const db = mongoose.connection.db
    const jobs = await db
      .collection('jobs')
      .find({}, { projection: { title: 1, location: 1 } })
      .toArray()

    if (!jobs || jobs.length === 0) {
      // Optional: seed sample data if DB is empty
      const seedJobs = [
        { title: 'Cleaner', location: 'Canada' },
        { title: 'Driver', location: 'Canada' },
      ]
      const insertResult = await db.collection('jobs').insertMany(seedJobs)
      const insertedJobs = await db
        .collection('jobs')
        .find({ _id: { $in: Object.values(insertResult.insertedIds) } })
        .toArray()
      const formattedJobs = insertedJobs.map((job: any) => ({
        _id: job._id.toString(),
        title: job.title,
        location: job.location,
      }))
      return res.status(200).json(formattedJobs)
    }

    const formattedJobs = jobs.map((job: any) => ({
      _id: job._id.toString(),
      title: job.title,
      location: job.location,
    }))

    return res.status(200).json(formattedJobs)
  } catch (error: any) {
    console.error('Failed to fetch jobs from MongoDB:', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
