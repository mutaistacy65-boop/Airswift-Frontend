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
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-indigo-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-all">
            <Plane className="text-white" size={24} />
          </div>
          <span className="hidden sm:inline text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            AIRSWIFT
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <Link href="/jobs" className="text-slate-300 hover:text-indigo-400 transition font-medium">
                Jobs
              </Link>
              <Link
                href={user?.role === 'admin' ? '/admin/dashboard' : '/job-seeker/dashboard'}
                className="text-slate-300 hover:text-indigo-400 transition font-medium flex items-center gap-2"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/about" className="text-slate-300 hover:text-indigo-400 transition">About</Link>
              <Link href="/contact" className="text-slate-300 hover:text-indigo-400 transition">Contact</Link>
            </>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-lg border border-indigo-500/20">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-300">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-red-500/30"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-300 hover:text-indigo-400 px-4 py-2 rounded-lg border border-indigo-400/30 hover:border-indigo-400/50 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-indigo-600/50"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-slate-300 hover:text-indigo-400 transition"
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
          className="md:hidden bg-slate-900/95 backdrop-blur-sm border-t border-indigo-500/20"
        >
          <div className="px-4 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="mb-4 flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg border border-indigo-500/20">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-300">{user?.name}</span>
                </div>

                <Link
                  href="/jobs"
                  className="block px-3 py-2 text-slate-300 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Jobs
                </Link>

                <Link
                  href={user?.role === 'admin' ? '/admin/dashboard' : '/job-seeker/dashboard'}
                  className="block px-3 py-2 text-slate-300 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500/80 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all mt-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  className="block px-3 py-2 text-slate-300 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition"
                  onClick={() => setMenuOpen(false)}
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  className="block px-3 py-2 text-slate-300 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Contact
                </Link>

                <Link
                  href="/login"
                  className="block px-3 py-2 text-slate-300 border border-indigo-400/30 rounded-lg hover:border-indigo-400/50 transition text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="block px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-center font-medium"
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
