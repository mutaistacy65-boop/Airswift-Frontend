import mongoose, { Schema, Document } from 'mongoose'

export interface IEmailTemplate extends Document {
  name: string
  subject: string
  body: string
  variables: string[]
  created_at: Date
  updated_at: Date
}

const emailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    variables: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const EmailTemplate =
  mongoose.models.EmailTemplate ||
  mongoose.model<IEmailTemplate>('EmailTemplate', emailTemplateSchema)

export default EmailTemplate
