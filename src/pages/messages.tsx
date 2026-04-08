import React, { useState, useEffect } from 'react'
import axios from 'axios'
import MainLayout from '@/layouts/MainLayout'
import { useAuth } from '@/context/AuthContext'

interface Message {
  _id: string
  subject: string
  message: string
  interview_date: string
  interview_time: string
  attachment_path?: string
  is_read: boolean
  created_at: string
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/messages')
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await axios.put(`/api/messages/${messageId}`, { is_read: true })
      setMessages(messages.map(m => (m._id === messageId ? { ...m, is_read: true } : m)))
      if (selectedMessage?._id === messageId) {
        setSelectedMessage({ ...selectedMessage, is_read: true })
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const downloadAttachment = (path: string) => {
    if (path) {
      window.open(path, '_blank')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

          {messages.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 text-lg">You don't have any messages yet.</p>
              <p className="text-gray-500 mt-2">
                Messages from admins about your interview will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Messages List */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow">
                  <div className="p-4 border-b">
                    <h2 className="font-bold text-gray-900">All Messages ({messages.length})</h2>
                  </div>
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {messages.map(message => (
                      <div
                        key={message._id}
                        onClick={() => {
                          setSelectedMessage(message)
                          if (!message.is_read) {
                            markAsRead(message._id)
                          }
                        }}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                          selectedMessage?._id === message._id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className={`text-sm font-medium ${
                              !message.is_read ? 'text-blue-600 font-bold' : 'text-gray-900'
                            }`}>
                              {message.subject}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(message.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {!message.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message Detail */}
              <div className="md:col-span-2">
                {selectedMessage ? (
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                      <p className="text-gray-500 mt-2">
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-bold text-blue-900 mb-2">Interview Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium ml-2">{selectedMessage.interview_date}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Time:</span>
                            <span className="font-medium ml-2">{selectedMessage.interview_time}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">Message</h3>
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {selectedMessage.message}
                        </div>
                      </div>

                      {selectedMessage.attachment_path && (
                        <div className="border-t pt-4">
                          <button
                            onClick={() => downloadAttachment(selectedMessage.attachment_path)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                          >
                            📄 Download Interview Instructions
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600">Select a message to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
