import mongoose, { Schema, Document } from 'mongoose'

export interface IApplication extends Document {
  user_id: mongoose.Types.ObjectId
  job_id: mongoose.Types.ObjectId
  national_id: string
  phone: string
  passport_path: string
  cv_path: string
  status: 'pending' | 'shortlisted' | 'rejected'
  created_at: Date
  updated_at: Date
}

const applicationSchema = new Schema<IApplication>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job_id: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    national_id: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    passport_path: {
      type: String,
      required: true,
    },
    cv_path: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const Application =
  mongoose.models.Application ||
  mongoose.model<IApplication>('Application', applicationSchema)

export default Application
