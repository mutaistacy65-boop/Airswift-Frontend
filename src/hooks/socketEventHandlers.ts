/**
 * Socket Event Handling Examples for Different Roles
 * 
 * This file demonstrates how to use socket events based on user role
 */

import { useEffect, useState } from 'react'
import { socket } from '@/services/socket'
import { useAuth } from '@/context/AuthContext'

/**
 * ADMIN SOCKET EVENTS
 */
export const useAdminSocketEvents = () => {
  const { user } = useAuth()
  const [adminUpdate, setAdminUpdate] = useState<any>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin' || !socket?.connected) return

    const handleNewApplication = (data: any) => {
      console.log('👑 [ADMIN] New application:', data)
      setAdminUpdate({ type: 'new_application', data, timestamp: Date.now() })
    }

    const handleApplicationStatusUpdate = (data: any) => {
      console.log('👑 [ADMIN] Application status updated:', data)
      setAdminUpdate({ type: 'status_update', data, timestamp: Date.now() })
    }

    const handleJobCreated = (data: any) => {
      console.log('👑 [ADMIN] New job created:', data)
      setAdminUpdate({ type: 'job_created', data, timestamp: Date.now() })
    }

    const handleJobUpdated = (data: any) => {
      console.log('👑 [ADMIN] Job updated:', data)
      setAdminUpdate({ type: 'job_updated', data, timestamp: Date.now() })
    }

    socket.on('admin:new-application', handleNewApplication)
    socket.on('application:status', handleApplicationStatusUpdate)
    socket.on('job:created', handleJobCreated)
    socket.on('job:updated', handleJobUpdated)

    // Cleanup
    return () => {
      socket.off('admin:new-application', handleNewApplication)
      socket.off('application:status', handleApplicationStatusUpdate)
      socket.off('job:created', handleJobCreated)
      socket.off('job:updated', handleJobUpdated)
    }
  }, [user])

  return adminUpdate
}

/**
 * USER SOCKET EVENTS
 */
export const useUserSocketEvents = () => {
  const { user } = useAuth()
  const [userUpdate, setUserUpdate] = useState<any>(null)

  useEffect(() => {
    if (!user || user.role !== 'user' || !socket?.connected) return

    const handleApplicationStatusChange = (data: any) => {
      console.log('👤 [USER] Your application status changed:', data)
      setUserUpdate({ type: 'application_status', data, timestamp: Date.now() })
    }

    const handleInterviewScheduled = (data: any) => {
      console.log('👤 [USER] Interview scheduled:', data)
      setUserUpdate({ type: 'interview_scheduled', data, timestamp: Date.now() })
    }

    const handleMessageReceived = (data: any) => {
      console.log('👤 [USER] New message:', data)
      setUserUpdate({ type: 'message_received', data, timestamp: Date.now() })
    }

    const handleNotification = (data: any) => {
      console.log('👤 [USER] Notification:', data)
      setUserUpdate({ type: 'notification', data, timestamp: Date.now() })
    }

    socket.on('user:application-status', handleApplicationStatusChange)
    socket.on('user:interview-scheduled', handleInterviewScheduled)
    socket.on('user:message-received', handleMessageReceived)
    socket.on('user:notification', handleNotification)

    // Cleanup
    return () => {
      socket.off('user:application-status', handleApplicationStatusChange)
      socket.off('user:interview-scheduled', handleInterviewScheduled)
      socket.off('user:message-received', handleMessageReceived)
      socket.off('user:notification', handleNotification)
    }
  }, [user])

  return userUpdate
}

/**
 * RECRUITER SOCKET EVENTS
 */
export const useRecruiterSocketEvents = () => {
  const { user } = useAuth()
  const [recruiterUpdate, setRecruiterUpdate] = useState<any>(null)

  useEffect(() => {
    if (!user || user.role !== 'recruiter' || !socket?.connected) return

    const handleCandidateApplication = (data: any) => {
      console.log('💼 [RECRUITER] New candidate application:', data)
      setRecruiterUpdate({ type: 'candidate_application', data, timestamp: Date.now() })
    }

    const handleJobStats = (data: any) => {
      console.log('💼 [RECRUITER] Job stats updated:', data)
      setRecruiterUpdate({ type: 'job_stats', data, timestamp: Date.now() })
    }

    socket.on('recruiter:candidate-application', handleCandidateApplication)
    socket.on('recruiter:job-stats', handleJobStats)

    // Cleanup
    return () => {
      socket.off('recruiter:candidate-application', handleCandidateApplication)
      socket.off('recruiter:job-stats', handleJobStats)
    }
  }, [user])

  return recruiterUpdate
}

/**
 * Example: Using the hooks in a component
 * 
 * import { useAdminSocketEvents } from '@/hooks/socketEventHandlers'
 * 
 * export default function MyComponent() {
 *   const update = useAdminSocketEvents()
 * 
 *   return (
 *     <div>
 *       {update && (
 *         <div className="alert">
 *           {update.type}: {JSON.stringify(update.data)}
 *         </div>
 *       )}
 *     </div>
 *   )
 * }
 */
