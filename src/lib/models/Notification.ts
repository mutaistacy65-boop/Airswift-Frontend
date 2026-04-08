// @ts-nocheck
import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  user_id: mongoose.Types.ObjectId
  title: string
  message: string
  is_read: boolean
  created_at: Date
  updated_at: Date
}

const notificationSchema = new Schema<INotification>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
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

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', notificationSchema)

export default Notification
