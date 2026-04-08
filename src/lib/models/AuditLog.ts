// @ts-nocheck
import mongoose, { Schema, Document } from 'mongoose'

export interface IAuditLog extends Document {
  user_id?: string // Optional for failed logins
  action: 'REGISTER' | 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'ACTION'
  ip_address: string
  user_agent: string
  browser?: string
  device_type?: string // Desktop, Mobile, Tablet
  os?: string
  location?: string
  details?: Record<string, any>
  is_suspicious?: boolean
  created_at: Date
  updated_at: Date
}

const AuditLogSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      enum: ['REGISTER', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'ACTION'],
      required: true,
      index: true,
    },
    ip_address: {
      type: String,
      required: true,
      index: true,
    },
    user_agent: {
      type: String,
      required: true,
    },
    browser: {
      type: String,
      default: null,
    },
    device_type: {
      type: String,
      enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
      default: 'Unknown',
    },
    os: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    is_suspicious: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

// Performance indexes
AuditLogSchema.index({ user_id: 1, created_at: -1 })
AuditLogSchema.index({ action: 1, created_at: -1 })
AuditLogSchema.index({ created_at: -1 })
AuditLogSchema.index({ ip_address: 1 })
AuditLogSchema.index({ is_suspicious: 1, created_at: -1 })

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)
