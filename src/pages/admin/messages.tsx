export const dynamic = "force-dynamic"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Textarea from '@/components/Textarea'
import { formatDate } from '@/utils/helpers'
import { Send, Trash2, Archive, MessageSquare, Search } from 'lucide-react'

interface Message {
  _id: string
  senderId: string
  senderName: string
  senderEmail: string
  subject: string
  body: string
  read: boolean
  archived: boolean
  createdAt: string
  attachments?: string[]
}

const AdminMessagesPage = () => {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isAuthorized, isLoading: protectedLoading } = useProtectedRoute('admin')
  const { addNotification } = useNotification()

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterView, setFilterView] = useState<'inbox' | 'archived'>('inbox')

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  const sidebarItems = [
    { label: '📊 Dashboard', href: '/admin/dashboard' },
    { label: '👥 Users', href: '/admin/users' },
    { label: '💼 Jobs', href: '/admin/jobs' },
    { label: '📝 Applications', href: '/admin/applications' },
    { label: '📞 Interviews', href: '/admin/interviews' },
    { label: '💰 Payments', href: '/admin/payments' },
    { label: '📋 Audit Logs', href: '/admin/audit' },
    { label: '🔍 Health', href: '/admin/health' },
    { label: '⚙️ Settings', href: '/admin/settings' },
  ]

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchMessages()
    }
  }, [user])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockMessages: Message[] = [
        {
          _id: '1',
          senderId: 'user1',
          senderName: 'John Doe',
          senderEmail: 'john@example.com',
          subject: 'Question about Software Developer position',
          body: 'Hi, I have some questions about the software developer position and would like to know more details.',
          read: false,
          archived: false,
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          senderId: 'user2',
          senderName: 'Jane Smith',
          senderEmail: 'jane@example.com',
          subject: 'Interview scheduling confirmation',
          body: 'Thank you for inviting me for an interview. I would like to confirm the time.',
          read: true,
          archived: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]
      setMessages(mockMessages)
    } catch (error) {
      addNotification('Failed to load messages', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = (messageId: string) => {
    setMessages(messages.map(msg => msg._id === messageId ? { ...msg, read: true } : msg))
  }

  const handleArchive = (messageId: string) => {
    setMessages(messages.map(msg => msg._id === messageId ? { ...msg, archived: true } : msg))
    addNotification('Message archived', 'success')
  }

  const handleDelete = (messageId: string) => {
    setMessages(messages.filter(msg => msg._id !== messageId))
    addNotification('Message deleted', 'success')
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      addNotification('Please write a reply', 'error')
      return
    }

    try {
      setSending(true)
      // Mock send - replace with actual API call
      addNotification('Reply sent successfully', 'success')
      setReplyText('')
      setShowReplyModal(false)
    } catch (error: any) {
      addNotification(error?.message || 'Failed to send reply', 'error')
    } finally {
      setSending(false)
    }
  }

  const openDetailModal = (msg: Message) => {
    handleMarkAsRead(msg._id)
    setSelectedMessage(msg)
    setShowDetailModal(true)
  }

  const filteredMessages = messages
    .filter(msg => filterView === 'inbox' ? !msg.archived : msg.archived)
    .filter(msg =>
      msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.senderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )

  if (authLoading || protectedLoading) return <Loader />
  
  if (!isAuthorized) return null

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">
            Manage inquiries from applicants and job seekers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-600">Total Messages</p>
            <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-600">Unread</p>
            <p className="text-2xl font-bold text-blue-600">
              {messages.filter(m => !m.read && !m.archived).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-600">Inbox</p>
            <p className="text-2xl font-bold text-green-600">
              {messages.filter(m => !m.archived).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-600">Archived</p>
            <p className="text-2xl font-bold text-gray-600">
              {messages.filter(m => m.archived).length}
            </p>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterView('inbox')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterView === 'inbox'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Inbox
            </button>
            <button
              onClick={() => setFilterView('archived')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterView === 'archived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Archived
            </button>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-md">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No messages found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`p-4 hover:bg-gray-50 transition cursor-pointer border-l-4 ${
                    msg.read ? 'border-l-gray-300' : 'border-l-blue-600 bg-blue-50'
                  }`}
                  onClick={() => openDetailModal(msg)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${msg.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {msg.senderName}
                        </h3>
                        {!msg.read && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{msg.subject}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{msg.body}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500">{formatDate(msg.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Detail Modal */}
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)}>
          {selectedMessage && (
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 border-b border-gray-200 pb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedMessage.subject}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    From: <strong>{selectedMessage.senderName}</strong> ({selectedMessage.senderEmail})
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>
              </div>

              {/* Message Body */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 whitespace-pre-line">
                {selectedMessage.body}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => {
                    handleArchive(selectedMessage._id)
                    setShowDetailModal(false)
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 inline-flex items-center gap-2"
                >
                  <Archive size={16} />
                  Archive
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedMessage._id)
                    setShowDetailModal(false)
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 inline-flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={() => setShowReplyModal(true)}
                  className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                >
                  <Send size={16} />
                  Reply
                </button>
              </div>

              {/* Attachments */}
              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment}
                        className="block text-blue-600 hover:underline text-sm"
                      >
                        📎 {attachment.split('/').pop()}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
            </div>
          )}
        </Modal>

        {/* Reply Modal */}
        <Modal isOpen={showReplyModal} onClose={() => setShowReplyModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Reply to {selectedMessage?.senderName}
            </h2>

            <Textarea
              label="Your Message"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              rows={6}
            />

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowReplyModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={sending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default AdminMessagesPage
