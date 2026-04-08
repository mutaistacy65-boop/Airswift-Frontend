// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  await connectDB()
  const db = mongoose.connection.db

  try {
    const {
      paymentId,
      status,
      transactionId,
      amount,
      currency = 'KES'
    } = req.body

    if (!paymentId || !status) {
      return res.status(400).json({ message: 'Payment ID and status are required' })
    }

    // Update payment status
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (transactionId) updateData.transactionId = transactionId
    if (amount) updateData.paidAmount = parseFloat(amount)
    if (currency) updateData.currency = currency

    const result = await db.collection('payments').updateOne(
      { _id: new ObjectId(paymentId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    // If payment is successful, update related application status
    if (status === 'completed') {
      const payment = await db.collection('payments').findOne({ _id: new ObjectId(paymentId) })

      if (payment?.applicationId) {
        // Update application status based on service type
        let applicationStatus = 'payment_completed'

        if (payment.serviceType === 'interview_fee') {
          applicationStatus = 'interview_payment_completed'
        } else if (payment.serviceType === 'background_check') {
          applicationStatus = 'background_check_completed'
        }

        await db.collection('applications').updateOne(
          { _id: new ObjectId(payment.applicationId) },
          {
            $set: {
              status: applicationStatus,
              paymentStatus: 'paid',
              updatedAt: new Date()
            }
          }
        )
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment status updated successfully'
    })

  } catch (error) {
    console.error('Error processing payment callback:', error)
    return res.status(500).json({ message: 'Failed to process payment callback' })
  }
}