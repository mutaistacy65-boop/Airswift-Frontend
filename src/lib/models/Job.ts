import mongoose, { Schema, Document } from 'mongoose'

export interface IJob extends Document {
  title: string
  description: string
  created_at: Date
  updated_at: Date
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const Job = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema)

export default Job
