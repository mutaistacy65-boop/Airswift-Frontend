import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Message from '@/lib/models/Message'
import Notification from '@/lib/models/Notification'
import User from '@/lib/models/User'
import jwt from 'jsonwebtoken'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const getAuthUser = async (req: NextApiRequest) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const user = await User.findById(decoded.userId)
    return user
  } catch (error) {
    return null
  }
}

const makeUploadDir = async () => {
  const folder = path.join(process.cwd(), 'public', 'uploads', 'interviews', `${Date.now()}`)
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
  return `/uploads/interviews/${path.basename(uploadDir)}/${safeName}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB()

  if (req.method === 'GET') {
    try {
      const user = await getAuthUser(req)
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const messages = await Message.find({ user_id: user._id }).sort({ created_at: -1 })
      const unreadCount = await Message.countDocuments({ user_id: user._id, is_read: false })

      return res.status(200).json({ success: true, messages, unreadCount })
    } catch (error) {
      console.error('Error fetching messages:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    const form = formidable({ multiples: true, keepExtensions: true })

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err)
        return res.status(500).json({ message: 'Error parsing form data' })
      }

      try {
        const user = await getAuthUser(req)
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: 'Only admins can send messages' })
        }

        const getSingleValue = (value: string | string[] | undefined) => {
          if (Array.isArray(value)) {
            return value[0] || ''
          }
          return value || ''
        }

        const userId = getSingleValue(fields.userId)
        const subject = getSingleValue(fields.subject)
        const message = getSingleValue(fields.message)
        const interviewDate = getSingleValue(fields.interviewDate)
        const interviewTime = getSingleValue(fields.interviewTime)

        if (!userId || !subject || !message || !interviewDate || !interviewTime) {
          return res.status(400).json({ message: 'Missing required fields' })
        }

        // Verify recipient exists
        const recipient = await User.findById(userId)
        if (!recipient) {
          return res.status(404).json({ message: 'Recipient not found' })
        }

        const uploadDir = await makeUploadDir()
        const attachmentFile = files.attachment as formidable.File | formidable.File[] | undefined

        let attachmentPath = null
        if (attachmentFile) {
          attachmentPath = Array.isArray(attachmentFile)
            ? await saveFile(attachmentFile[0], uploadDir)
            : await saveFile(attachmentFile, uploadDir)
        }

        // Create message
        const newMessage = new Message({
          user_id: userId,
          subject,
          message,
          interview_date: interviewDate,
          interview_time: interviewTime,
          attachment_path: attachmentPath,
          is_read: false,
        })

        await newMessage.save()

        // Create notification
        const notification = new Notification({
          user_id: userId,
          title: '🎯 Interview Scheduled',
          message: `You have a new message: ${subject}. Check your messages for details.`,
          is_read: false,
        })
        await notification.save()

        // Emit real-time event to user via Socket.IO
        const io = (res.socket as any)?.server?.io
        if (io) {
          try {
            // Emit to specific user
            io.to(`user-${userId}`).emit('new_message', {
              message: newMessage,
              notification,
            })
            
            // Also emit global event
            io.emit('application_message_sent', {
              user_id: userId,
              subject,
            })
          } catch (socketErr) {
            console.warn('Socket emission failed:', socketErr)
          }
        }

        return res.status(201).json({ success: true, message: newMessage, notification })
      } catch (error: any) {
        console.error('Error creating message:', error)
        return res.status(500).json({ message: 'Internal server error' })
      }
    })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
