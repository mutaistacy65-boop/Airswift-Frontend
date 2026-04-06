import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { verifyToken } from '@/lib/authController'
import { ObjectId } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB()
  const db = mongoose.connection.db

  switch (req.method) {
    case 'POST':
      try {
        const { amount, serviceType, applicationId, description } = req.body

        if (!amount || !serviceType) {
          return res.status(400).json({ message: 'Amount and service type are required' })
        }

        // Verify user authentication for payment initiation
        let userId = null
        try {
          const decoded: any = await verifyToken(req)
          userId = decoded?.userId
        } catch (error) {
          // Allow unauthenticated payment initiation but track user if logged in
        }

        const paymentData = {
          amount: parseFloat(amount),
          serviceType, // 'interview_fee', 'background_check', etc.
          applicationId: applicationId || null,
          description: description || `${serviceType.replace('_', ' ')} payment`,
          status: 'pending',
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const result = await db.collection('payments').insertOne(paymentData)

        // In production, integrate with AfricasTalking or other payment gateway
        // For now, simulate payment gateway response
        const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/${result.insertedId.toString()}`

        return res.status(200).json({
          paymentId: result.insertedId.toString(),
          paymentUrl,
          status: 'pending'
        })

      } catch (error) {
        console.error('Error initiating payment:', error)
        return res.status(500).json({ message: 'Failed to initiate payment' })
      }

    default:
      res.setHeader('Allow', ['POST'])
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}