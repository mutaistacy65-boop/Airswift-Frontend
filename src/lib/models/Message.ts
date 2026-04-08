// @ts-nocheck
import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
  user_id: mongoose.Types.ObjectId
  subject: string
  message: string
  interview_date: string
  interview_time: string
  attachment_path?: string
  is_read: boolean
  created_at: Date
  updated_at: Date
}

const messageSchema = new Schema<IMessage>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    interview_date: {
      type: String,
      required: true,
    },
    interview_time: {
      type: String,
      required: true,
    },
    attachment_path: {
      type: String,
      default: null,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const Message =
  mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema)

export default Message
