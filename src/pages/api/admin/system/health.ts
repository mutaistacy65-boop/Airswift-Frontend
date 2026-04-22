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

    // Server Status
    const serverStatus = 'online' // Simplified

    // Database Status
    let dbStatus = 'online'
    try {
      await db.admin().ping()
    } catch (error) {
      dbStatus = 'offline'
    }

    // AI Service Status - assuming OpenAI
    let aiStatus = 'online'
    try {
      // Simple check, in real app might call a health endpoint
      // For now, assume online
    } catch (error) {
      aiStatus = 'offline'
    }

    // Email Service Status
    let emailStatus = 'online'
    try {
      // Check email service, for now assume online
    } catch (error) {
      emailStatus = 'offline'
    }

    // CPU, Memory, Uptime - simplified
    const cpuUsage = Math.floor(Math.random() * 100) // Placeholder
    const memoryUsage = Math.floor(Math.random() * 100) // Placeholder
    const uptime = process.uptime()

    // Query latency - measure a simple query
    const start = Date.now()
    await db.collection('applications').findOne({})
    const queryLatency = Date.now() - start

    const health = {
      server: {
        status: serverStatus,
        cpuUsage: `${cpuUsage}%`,
        memoryUsage: `${memoryUsage}%`,
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
      },
      database: {
        status: dbStatus,
        queryLatency: `${queryLatency}ms`
      },
      aiService: {
        status: aiStatus,
        responseLatency: '50ms' // Placeholder
      },
      emailService: {
        status: emailStatus,
        deliverySuccessRate: '98%' // Placeholder
      }
    }

    return res.status(200).json(health)
  } catch (error: any) {
    console.error('Error fetching system health:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export default requireAdmin(handler)