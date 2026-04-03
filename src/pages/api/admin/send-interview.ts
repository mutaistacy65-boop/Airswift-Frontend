import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { email, name, meetLink, date } = req.body

  if (!email || !name || !meetLink || !date) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    const { db } = await connectToDatabase()
    // For demonstration, store interview notification as a record
    await db.collection('interviewNotifications').insertOne({
      email,
      name,
      meetLink,
      date,
      sentAt: new Date(),
    })

    console.log(`Interview email would be sent to ${email} (${name}) with link ${meetLink} on ${date}`)

    return res.status(200).json({ message: 'Interview email sent (simulated)' })
  } catch (error: any) {
    console.error('Error sending interview notification', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
