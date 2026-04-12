import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSocket } from '@/hooks/useSocket'
import { api } from '@/utils/api'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const { subscribe } = useSocket()

  useEffect(() => {
    fetchData()
    
    // Subscribe to new messages and notifications
    subscribe('new_message', handleNewMessage)
    subscribe('new_notification', handleNewNotification)
  }, [subscribe])

  const fetchData = async () => {
    try {
      const [notifRes, msgRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/messages'),
      ])
      setNotifications(notifRes.data.notifications || [])
      setMessages(msgRes.data.messages || [])
      setUnreadCount((notifRes.data.unreadCount || 0) + (msgRes.data.unreadCount || 0))
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleNewMessage = (data: any) => {
    setMessages(prev => [data.message, ...prev])
    setUnreadCount(prev => prev + 1)
  }

  const handleNewNotification = (data: any) => {
    setNotifications(prev => [data.notification, ...prev])
    setUnreadCount(prev => prev + 1)
  }

  const markAsRead = async (id: string, type: 'notification' | 'message') => {
    try {
      const endpoint = type === 'notification' 
        ? `/notifications/${id}`
        : `/messages/${id}`
      await api.put(endpoint, { is_read: true })
      
      if (type === 'notification') {
        setNotifications(notifications.map(n => (n._id === id ? { ...n, is_read: true } : n)))
      } else {
        setMessages(messages.map(m => (m._id === id ? { ...m, is_read: true } : m)))
      }
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <h3 className="font-bold text-gray-900">Notifications</h3>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 && messages.length === 0 ? (
              <div className="p-4 text-center text-gray-600">No notifications</div>
            ) : (
              <>
                {notifications.map(notif => (
                  <div
                    key={notif._id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      notif.is_read ? 'opacity-75' : 'bg-blue-50'
                    }`}
                    onClick={() => markAsRead(notif._id, 'notification')}
                  >
                    <h4 className="font-medium text-gray-900">{notif.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{notif.message}</p>
                  </div>
                ))}
                {messages.map(msg => (
                  <div
                    key={msg._id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      msg.is_read ? 'opacity-75' : 'bg-blue-50'
                    }`}
                    onClick={() => markAsRead(msg._id, 'message')}
                  >
                    <h4 className="font-medium text-gray-900">{msg.subject}</h4>
                    <p className="text-sm text-gray-600 truncate">{msg.message}</p>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="p-4 border-t text-center">
            <Link href="/messages">
              <a className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Messages →
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
