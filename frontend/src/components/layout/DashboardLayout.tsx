'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Spinner } from '@/components/ui'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
    if (!loading && isAuthenticated && user?.role === 'student' && !user?.has_completed_placement) {
      router.push('/onboarding')
    }
  }, [loading, isAuthenticated, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Navbar />
      <Sidebar />
      <div className="pt-16 lg:pl-[220px]">
        <div className="p-3 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-7rem)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
