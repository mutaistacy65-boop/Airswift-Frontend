import React from 'react'
import Link from 'next/link'

interface UserSidebarProps {
  sidebarItems: { label: string; href: string; icon?: string }[]
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const UserSidebar: React.FC<UserSidebarProps> = ({ sidebarItems, sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 overflow-y-auto md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex items-center justify-between bg-gradient-to-r from-primary to-secondary">
          <h2 className={`text-xl font-bold uppercase tracking-wide text-white ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
            TALEX
          </h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-primary/80 rounded text-white"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>
        <nav className="mt-8 space-y-2 px-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 rounded-lg hover:bg-gray-700 transition text-gray-300 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}

export default UserSidebar