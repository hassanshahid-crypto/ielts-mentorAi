'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Card, CardBody, Spinner } from '@/components/ui'
import { Users, FileText, Mic, BookOpen, TrendingUp, Activity } from 'lucide-react'
import type { AdminOverview } from '@/types'

export default function AdminPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.adminOverview().then(setOverview).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl border-gray-100 shadow-soft animate-slide-up">
          <CardBody className="p-5">
            <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold font-display text-gray-900">{overview?.total_students || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Total Students</p>
          </CardBody>
        </Card>
        <Card className="rounded-2xl border-gray-100 shadow-soft animate-slide-up">
          <CardBody className="p-5">
            <div className="h-11 w-11 bg-green-50 rounded-xl flex items-center justify-center mb-4">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold font-display text-gray-900">{overview?.active_students || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Active Students (7d)</p>
          </CardBody>
        </Card>
        <Card className="rounded-2xl border-gray-100 shadow-soft animate-slide-up">
          <CardBody className="p-5">
            <div className="h-11 w-11 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold font-display text-gray-900">{overview?.total_tests || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Total Tests</p>
          </CardBody>
        </Card>
        <Card className="rounded-2xl border-gray-100 shadow-soft animate-slide-up">
          <CardBody className="p-5">
            <div className="h-11 w-11 bg-accent-50 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="h-5 w-5 text-accent-600" />
            </div>
            <p className="text-3xl font-bold font-display text-gray-900">{overview?.avg_writing_band || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Avg Writing Band</p>
          </CardBody>
        </Card>
      </div>

      {/* Test Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="rounded-2xl border-gray-100 shadow-soft">
          <CardBody className="p-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Writing Tests</p>
            </div>
            <p className="text-3xl font-bold font-display text-gray-900">{overview?.total_writing_tests || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Avg Band: {overview?.avg_writing_band || 0}</p>
          </CardBody>
        </Card>
        <Card className="rounded-2xl border-gray-100 shadow-soft">
          <CardBody className="p-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Mic className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Speaking Tests</p>
            </div>
            <p className="text-3xl font-bold font-display text-gray-900">{overview?.total_speaking_tests || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Avg Band: {overview?.avg_speaking_band || 0}</p>
          </CardBody>
        </Card>
        <Card className="rounded-2xl border-gray-100 shadow-soft">
          <CardBody className="p-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Reading Tests</p>
            </div>
            <p className="text-3xl font-bold font-display text-gray-900">{overview?.total_reading_tests || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Avg Score: {overview?.avg_reading_score || 0}</p>
          </CardBody>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="rounded-2xl border-gray-100 shadow-soft">
        <CardBody className="p-6">
          <h3 className="font-semibold font-display text-gray-900 mb-5 text-lg">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/students" className="rounded-2xl bg-gray-50/80 hover:bg-gray-100 p-5 border border-gray-100 hover:border-gray-200 text-center transition-all group">
              <div className="bg-primary-50 h-11 w-11 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Manage Students</p>
            </Link>
            <Link href="/admin/reading" className="rounded-2xl bg-gray-50/80 hover:bg-gray-100 p-5 border border-gray-100 hover:border-gray-200 text-center transition-all group">
              <div className="bg-purple-50 h-11 w-11 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Reading Tests</p>
            </Link>
            <Link href="/admin/writing" className="rounded-2xl bg-gray-50/80 hover:bg-gray-100 p-5 border border-gray-100 hover:border-gray-200 text-center transition-all group">
              <div className="bg-blue-50 h-11 w-11 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Writing Tests</p>
            </Link>
            <Link href="/admin/speaking" className="rounded-2xl bg-gray-50/80 hover:bg-gray-100 p-5 border border-gray-100 hover:border-gray-200 text-center transition-all group">
              <div className="bg-green-50 h-11 w-11 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Mic className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Speaking Tests</p>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
