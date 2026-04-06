import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import { Menu, X, Plane, LogOut, LayoutDashboard, Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      const resolvedTheme = storedTheme || 'dark'
      setTheme(resolvedTheme)
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    }
  }, [])

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-primary p-2 rounded-lg group-hover:shadow-md transition-all">
            💼
          </div>
          <span className="hidden sm:inline text-xl md:text-2xl font-bold text-primary">
            TALEX
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <Link href="/jobs" className="text-gray-600 hover:text-primary transition font-medium">
                Jobs
              </Link>
              <Link
                href={user?.role === 'admin' ? '/admin/dashboard' : '/job-seeker/dashboard'}
                className="text-gray-600 hover:text-primary transition font-medium flex items-center gap-2"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/about" className="text-gray-600 hover:text-primary transition">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-primary transition">Contact</Link>
            </>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-danger hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-red-500/30"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-primary hover:text-green-600 px-4 py-2 rounded-lg border border-primary transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-green-500/30"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-600 hover:text-primary transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-gray-50 border-t border-gray-200"
        >
          <div className="px-4 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="mb-4 flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </div>

                <Link
                  href="/jobs"
                  className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-green-50 rounded-lg transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Jobs
                </Link>

                <Link
                  href={user?.role === 'admin' ? '/admin/dashboard' : '/job-seeker/dashboard'}
                  className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-green-50 rounded-lg transition flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full bg-danger hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all mt-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-green-50 rounded-lg transition"
                  onClick={() => setMenuOpen(false)}
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-green-50 rounded-lg transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Contact
                </Link>

                <Link
                  href="/login"
                  className="block px-3 py-2 text-primary border border-primary rounded-lg hover:bg-green-50 transition text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="block px-3 py-2 bg-primary hover:bg-green-600 text-white rounded-lg transition text-center font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  )
}

export default Navbar
