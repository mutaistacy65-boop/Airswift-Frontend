/**
 * User Dashboard Socket Integration
 * Real-time updates for job seekers
 */

import toast from 'react-hot-toast'
import { socket } from '@/services/socket'
import { formatDateTime } from '@/utils/helpers'
import { getStatusLabel } from '@/utils/statusColors'

/**
 * 🔥 Setup Real-Time Application Updates for Users
 * Call this in your user dashboard
 */
export const setupUserSocketListeners = (callbacks: {
  onApplicationUpdated?: (data: any) => void
  onInterviewScheduled?: (data: any) => void
  onPaymentSuccess?: (data: any) => void
  onStatusChanged?: (data: any) => void
}) => {
  if (!socket || !socket.connected) {
    console.warn('⚠️ Socket not connected, skipping user listeners setup')
    return
  }

  console.log('📡 Setting up user socket listeners...')

  // 📩 Application Status Updated
  socket.on('applicationUpdated', (data) => {
    console.log('🔥 Application Updated:', data)
    toast.success(`Your application status: ${getStatusLabel(data.status || 'pending')}`, {
      duration: 5000,
      icon: '📩',
    })
    callbacks.onApplicationUpdated?.(data)
  })

  // 📅 Interview Scheduled
  socket.on('interviewScheduled', (data) => {
    console.log('🔥 Interview Scheduled:', data)
    toast.success(`Interview scheduled for ${formatDateTime(data.interviewDate)}`, {
      duration: 5000,
      icon: '📅',
    })
    callbacks.onInterviewScheduled?.(data)
  })

  // 💰 Payment Received
  socket.on('paymentSuccess', (data) => {
    console.log('🔥 Payment Success:', data)
    toast.success('💰 Payment processed! Visa processing started.', {
      duration: 5000,
      icon: '✅',
    })
    callbacks.onPaymentSuccess?.(data)
  })

  // 🎯 Status Changed (Alternative event)
  socket.on('statusChanged', (data) => {
    console.log('🔥 Status Changed:', data)
    const statusIcon = {
      pending: '⏳',
      reviewed: '👀',
      shortlisted: '✨',
      interview_scheduled: '📞',
      interview_completed: '✅',
      rejected: '❌',
      offer_made: '🎉',
      visa_ready: '🛫',
    }[data.status] || '📝'

    toast.success(`Status: ${getStatusLabel(data.status)}`, {
      duration: 5000,
      icon: statusIcon,
    })
    callbacks.onStatusChanged?.(data)
  })

  // 🔔 General Notification
  socket.on('notification', (data) => {
    console.log('🔔 Notification:', data)
    if (data.type === 'success') {
      toast.success(data.message, { duration: 4000 })
    } else if (data.type === 'error') {
      toast.error(data.message, { duration: 4000 })
    } else {
      toast(data.message, { duration: 4000 })
    }
    callbacks.onApplicationUpdated?.(data)
  })

  console.log('✅ User socket listeners setup complete')
}

/**
 * 🧹 Cleanup Socket Listeners
 */
export const cleanupUserSocketListeners = () => {
  if (!socket) return

  console.log('🧹 Cleaning up user socket listeners...')
  socket.off('applicationUpdated')
  socket.off('interviewScheduled')
  socket.off('paymentSuccess')
  socket.off('statusChanged')
  socket.off('notification')
}

/**
 * 📤 Emit Events from User Dashboard
 */
export const emitUserEvent = (event: string, data: any) => {
  if (!socket || !socket.connected) {
    console.warn('⚠️ Socket not connected')
    return
  }
  socket.emit(event, data)
}
