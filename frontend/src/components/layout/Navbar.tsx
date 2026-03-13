'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Menu, X, User, LogOut, BookOpen } from 'lucide-react'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">IELTS Mentor</span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:flex ml-10 space-x-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
                <Link href="/writing" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Writing</Link>
                <Link href="/speaking" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Speaking</Link>
                <Link href="/reading" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Reading</Link>
                {user?.role === 'admin' && (
                  <Link href="/admin" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Admin</Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user?.first_name || user?.username}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                      <User className="h-4 w-4 mr-2" /> Profile
                    </Link>
                    <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">Login</Link>
                <Link href="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Get Started</Link>
              </div>
            )}

            <button className="md:hidden ml-3" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && isAuthenticated && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-1">
            <Link href="/dashboard" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            <Link href="/writing" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>Writing</Link>
            <Link href="/speaking" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>Speaking</Link>
            <Link href="/reading" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>Reading</Link>
            <Link href="/results" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>Results</Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => setMobileOpen(false)}>Admin</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
