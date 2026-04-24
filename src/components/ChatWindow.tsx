import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/hooks/useSocket'
import API from '@/services/apiClient'

export interface Message {
  _id: string
  sender: { _id: string; name: string; role: string }
  recipient: { _id: string; name: string; role: string }
  content: string
  attachment?: { url: string; name: string }
  timestamp: string
  read: boolean
}

interface ChatWindowProps {
  messages: Message[]
  loading?: boolean
  onSendMessage?: (content: string, attachment?: File) => void
  sending?: boolean
  recipientName?: string
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  loading = false,
  onSendMessage,
  sending = false,
  recipientName = 'Admin',
}) => {
  const [messageContent, setMessageContent] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!messageContent.trim() && !selectedFile) return

    if (onSendMessage) {
      onSendMessage(messageContent, selectedFile || undefined)
    }

    setMessageContent('')
    setSelectedFile(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow animate-pulse">
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Chat Header */}
      <div className="border-b p-4 bg-gray-50">
        <h2 className="font-bold text-gray-900">💬 Chat with {recipientName}</h2>
        <p className="text-sm text-gray-600">Real-time messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender._id === user?.id || message.sender._id === user?._id
            return (
              <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-900 rounded-bl-none'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  {message.attachment && (
                    <a
                      href={message.attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs mt-2 block underline ${
                        isOwn ? 'text-gray-200' : 'text-primary'
                      }`}
                    >
                      📎 {message.attachment.name}
                    </a>
                  )}
                  <p className={`text-xs mt-1 ${isOwn ? 'text-gray-200' : 'text-gray-600'}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-gray-50">
        {selectedFile && (
          <div className="mb-2 p-2 bg-blue-50 rounded flex items-center justify-between">
            <span className="text-sm text-gray-700">📎 {selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex items-end space-x-2">
          <label className="cursor-pointer text-gray-600 hover:text-gray-900">
            📎
            <input
              type="file"
              hidden
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              disabled={sending}
            />
          </label>
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={3}
            disabled={sending}
            className="flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          />
          <button
            onClick={handleSend}
            disabled={sending || (!messageContent.trim() && !selectedFile)}
            className="bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition duration-200 font-medium"
          >
            {sending ? '⏳' : '📤'} Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
