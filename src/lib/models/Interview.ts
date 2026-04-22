// @ts-nocheck
import mongoose, { Schema, Document } from 'mongoose'

export interface IInterview extends Document {
  applicationId: mongoose.Types.ObjectId
  candidateId: mongoose.Types.ObjectId
  jobId: mongoose.Types.ObjectId
  interviewerId?: mongoose.Types.ObjectId
  scheduledAt: Date
  duration: number // in minutes
  mode: 'online' | 'in-person'
  meetingLink?: string
  status: 'scheduled' | 'completed' | 'no-show' | 'cancelled' | 'rescheduled'
  interviewType: 'HR' | 'Technical' | 'Final'
  notes?: string
  feedback?: {
    rating: number
    comments: string
    interviewerId: mongoose.Types.ObjectId
  }
  participants?: mongoose.Types.ObjectId[] // multiple interviewers
  createdAt: Date
  updatedAt: Date
}

const InterviewSchema: Schema = new Schema({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  interviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 60 // 60 minutes
  },
  mode: {
    type: String,
    enum: ['online', 'in-person'],
    default: 'online'
  },
  meetingLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'no-show', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  interviewType: {
    type: String,
    enum: ['HR', 'Technical', 'Final'],
    default: 'HR'
  },
  notes: {
    type: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
})

// Indexes for performance
InterviewSchema.index({ scheduledAt: 1 })
InterviewSchema.index({ candidateId: 1 })
InterviewSchema.index({ interviewerId: 1 })
InterviewSchema.index({ status: 1 })
InterviewSchema.index({ scheduledAt: 1, status: 1 })

// Prevent double booking
InterviewSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('scheduledAt') || this.isModified('interviewerId')) {
    const conflictingInterview = await mongoose.model('Interview').findOne({
      interviewerId: this.interviewerId,
      scheduledAt: {
        $gte: new Date((this.scheduledAt as Date).getTime() - 30 * 60 * 1000), // 30 min before
        $lt: new Date((this.scheduledAt as Date).getTime() + (this.duration as number) * 60 * 1000) // interview duration
      },
      status: { $in: ['scheduled', 'rescheduled'] },
      _id: { $ne: this._id }
    })

    if (conflictingInterview) {
      next(new Error('Interviewer has a conflicting interview scheduled'))
    }
  }
  next()
})

export default mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema)