import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import { useNotification } from '@/context/NotificationContext'
import UserDashboardLayout from '@/components/UserDashboardLayout'
import ChatWindow from '@/components/ChatWindow'
import Loader from '@/components/Loader'
import API from '@/services/apiClient'

interface Message {
  _id: string
  sender: { _id: string; name: string; role: string }
  recipient: { _id: string; name: string; role: string }
  content: string
  attachment?: { url: string; name: string }
  timestamp: string
  read: boolean
}

export default function MessagesPage() {
  const { user, isLoading } = useAuth()
  const { subscribe } = useSocket()
  const { addNotification } = useNotification()
  const router = useRouter()

  const [messagesLoading, setMessagesLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)

  // Guard: Check authentication
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user?.role !== 'user') {
      router.push('/unauthorized')
      return
    }
  }, [user, isLoading, router])

  // Load messages on mount
  useEffect(() => {
    if (!user) return

    const loadMessages = async () => {
      try {
        setMessagesLoading(true)
        const response = await API.get('/messages')
        setMessages(response.data.messages || [])
      } catch (error) {
        console.error('Error loading messages:', error)
        addNotification('Failed to load messages', 'error')
      } finally {
        setMessagesLoading(false)
      }
    }

    loadMessages()
  }, [user, addNotification])

  // Real-time message updates via socket
  useEffect(() => {
    const unsubscribe = subscribe('new_message', (data: any) => {
      const newMessage: Message = {
        _id: data._id,
        sender: data.sender,
        recipient: data.recipient,
        content: data.content,
        attachment: data.attachment,
        timestamp: data.timestamp,
        read: false,
      }

      setMessages((prev) => [newMessage, ...prev])
      addNotification(`📨 New message from ${data.sender.name}`, 'info')
    })

    return () => unsubscribe()
  }, [subscribe, addNotification])

  // Mark messages as read
  useEffect(() => {
    const markAsRead = async () => {
      try {
        await API.put('/messages/mark-as-read')
      } catch (error) {
        console.error('Error marking messages as read:', error)
      }
    }

    if (messages.length > 0) {
      markAsRead()
    }
  }, [messages])

  const handleSendMessage = async (content: string, attachment?: File) => {
    if (!content.trim() && !attachment) return

    try {
      setSending(true)

      const formData = new FormData()
      formData.append('content', content)
      formData.append('recipient', 'admin') // Send to admin

      if (attachment) {
        formData.append('attachment', attachment)
      }

      const response = await API.post('/messages/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const newMessage: Message = response.data.message

      setMessages((prev) => [newMessage, ...prev])
      addNotification('✅ Message sent', 'success')
    } catch (error: any) {
      console.error('Error sending message:', error)
      addNotification(error.response?.data?.message || 'Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  if (isLoading || !user) {
    return <Loader fullScreen />
  }

  const unreadCount = messages.filter((m) => !m.read && m.sender.role === 'admin').length

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💬 Messages</h1>
          <p className="text-gray-600 mt-2">Communicate with our admin team</p>
          {unreadCount > 0 && (
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-700">
                You have <strong>{unreadCount}</strong> unread message{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <ChatWindow
              messages={messages}
              loading={messagesLoading}
              onSendMessage={handleSendMessage}
              sending={sending}
              recipientName="Admin"
            />
          </div>

          {/* Sidebar - Message Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Message Stats</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
              </div>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-yellow-600">{unreadCount}</p>
              </div>
              {messages.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Last Message</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(messages[0].timestamp).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">💡 Need Help?</h3>
              <ul className="text-xs text-gray-600 space-y-2">
                <li>• Response time: 24-48 hours</li>
                <li>• Include job title in message</li>
                <li>• Attach relevant files</li>
                <li>• Check email for notifications</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Message Guidelines */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Message Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded p-4">
              <p className="font-medium text-gray-900">✅ Do's</p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Be clear and concise</li>
                <li>• Include relevant details</li>
                <li>• Check spelling</li>
              </ul>
            </div>
            <div className="bg-white rounded p-4">
              <p className="font-medium text-gray-900">❌ Don'ts</p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Send spam or duplicates</li>
                <li>• Use inappropriate language</li>
                <li>• Share sensitive data</li>
              </ul>
            </div>
            <div className="bg-white rounded p-4">
              <p className="font-medium text-gray-900">⚡ Tips</p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Reference your app details</li>
                <li>• Ask specific questions</li>
                <li>• Keep it professional</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
