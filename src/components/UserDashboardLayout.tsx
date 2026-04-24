import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'

interface UserDashboardLayoutProps {
  children: React.ReactNode
}

const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const [notificationCount, setNotificationCount] = useState(0)

  const menuItems = [
    { label: '🏠 Dashboard', href: '/job-seeker/dashboard', icon: '📊' },
    { label: '📝 Apply', href: '/apply', icon: '📝' },
    { label: '📂 Applications', href: '/job-seeker/applications', icon: '📂' },
    { label: '📅 Interviews', href: '/job-seeker/interviews', icon: '📅' },
    { label: '💬 Messages', href: '/job-seeker/messages', icon: '💬' },
    { label: '⚙️ Settings', href: '/job-seeker/settings', icon: '⚙️' },
  ]

  const isActive = (href: string) => router.pathname === href

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform transition-transform duration-300 overflow-y-auto md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo/Brand */}
        <div className="p-4 bg-gradient-to-r from-primary to-secondary flex items-center justify-between">
          <h1 className="text-2xl font-bold uppercase tracking-wider">TALEX</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-black/20 rounded transition"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="border-b border-gray-700 p-4">
          <p className="text-sm text-gray-400">Welcome,</p>
          <p className="font-semibold text-white truncate">{user?.name || 'User'}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 space-y-2 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                isActive(item.href)
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-900">
          <button
            onClick={() => {
              logout()
              setSidebarOpen(false)
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded transition"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>

            <Link href="/" className="flex-1 ml-4 md:ml-0">
              <h1 className="text-xl font-bold text-gray-900">TALEX</h1>
            </Link>

            <div className="flex items-center space-x-4">
              {/* Notifications Bell */}
              <Link
                href="/job-seeker/notifications"
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                aria-label="Notifications"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.role || 'User'}</p>
                </div>
                <Link
                  href="/job-seeker/settings"
                  className="inline-block p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  👤
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserDashboardLayout
