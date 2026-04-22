// @ts-nocheck
import mongoose, { Schema, Document } from 'mongoose'

export interface IInterviewParticipant extends Document {
  interviewId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  role: 'lead' | 'panel' | 'observer'
  joinedAt?: Date
  leftAt?: Date
  createdAt: Date
  updatedAt: Date
}

const InterviewParticipantSchema: Schema = new Schema({
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['lead', 'panel', 'observer'],
    default: 'panel'
  },
  joinedAt: {
    type: Date
  },
  leftAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Ensure unique participant per interview
InterviewParticipantSchema.index({ interviewId: 1, userId: 1 }, { unique: true })

export default mongoose.models.InterviewParticipant || mongoose.model<IInterviewParticipant>('InterviewParticipant', InterviewParticipantSchema)