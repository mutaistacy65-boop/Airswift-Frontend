import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import UserTopBar from '@/components/UserTopBar'
import UserSidebar from '@/components/UserSidebar'

interface UserLayoutProps {
  children: React.ReactNode
  sidebarItems?: { label: string; href: string; icon?: string }[]
}

const UserLayout: React.FC<UserLayoutProps> = ({ children, sidebarItems }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50 page-watermark overflow-hidden">
      <UserSidebar sidebarItems={sidebarItems || []} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:pl-64">
        <UserTopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserLayout