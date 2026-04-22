// @ts-nocheck
import mongoose, { Schema, Document } from 'mongoose'

export interface IInterviewFeedback extends Document {
  interviewId: mongoose.Types.ObjectId
  interviewerId: mongoose.Types.ObjectId
  rating: number // 1-5 scale
  comments: string
  strengths?: string[]
  weaknesses?: string[]
  recommendation: 'hire' | 'reject' | 'consider' | 'follow-up'
  createdAt: Date
  updatedAt: Date
}

const InterviewFeedbackSchema: Schema = new Schema({
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  interviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comments: {
    type: String,
    required: true
  },
  strengths: [{
    type: String
  }],
  weaknesses: [{
    type: String
  }],
  recommendation: {
    type: String,
    enum: ['hire', 'reject', 'consider', 'follow-up'],
    required: true
  }
}, {
  timestamps: true
})

// Ensure one feedback per interviewer per interview
InterviewFeedbackSchema.index({ interviewId: 1, interviewerId: 1 }, { unique: true })

export default mongoose.models.InterviewFeedback || mongoose.model<IInterviewFeedback>('InterviewFeedback', InterviewFeedbackSchema)