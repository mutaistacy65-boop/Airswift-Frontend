import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  return (
    <nav className="bg-white shadow-md navbar-watermark">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="font-black text-red-600 uppercase tracking-widest text-3xl md:text-5xl lg:text-6xl leading-tight">
          Airswift
        </Link>

        <div className="hidden md:flex space-x-8 items-center">
          {isAuthenticated && (
            <Link href="/jobs" className="text-gray-700 hover:text-primary">
              Jobs
            </Link>
          )}
          {isAuthenticated && (
            <Link
              href={user?.role === 'admin' ? '/admin/dashboard' : '/job-seeker/dashboard'}
              className="text-gray-700 hover:text-primary"
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="hidden md:flex space-x-6 items-center">
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user?.name}</span>
                <button
                  onClick={() => {
                    logout()
                    setMenuOpen(false)
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-primary border px-4 py-2 rounded"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-4">
          {isAuthenticated && (
            <Link href="/jobs" className="block text-gray-700 hover:text-primary">
              Jobs
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <Link
                href={user?.role === 'admin' ? '/admin/dashboard' : '/job-seeker/dashboard'}
                className="block text-gray-700 hover:text-primary"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout()
                  setMenuOpen(false)
                }}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-gray-700">
                Login
              </Link>
              <Link href="/register" className="block bg-primary text-white px-4 py-2 rounded">
                Register
              </Link>
            </>
          )}
          <Link href="/about" className="block text-gray-700 hover:text-primary border-t pt-4">
            About
          </Link>
          <Link href="/contact" className="block text-gray-700 hover:text-primary">
            Contact
          </Link>
          <Link href="/report" className="block text-gray-700 hover:text-primary">
            Report Issue
          </Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar