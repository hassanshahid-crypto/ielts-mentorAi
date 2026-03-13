'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Spinner } from '@/components/ui'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <main className="lg:ml-64 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
