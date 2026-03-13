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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{overview?.total_students || 0}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Students (7d)</p>
                <p className="text-3xl font-bold text-gray-900">{overview?.active_students || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tests</p>
                <p className="text-3xl font-bold text-gray-900">{overview?.total_tests || 0}</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Writing Band</p>
                <p className="text-3xl font-bold text-gray-900">{overview?.avg_writing_band || 0}</p>
              </div>
              <div className="h-12 w-12 bg-accent-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Test Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="text-center">
            <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{overview?.total_writing_tests || 0}</p>
            <p className="text-sm text-gray-500">Writing Tests</p>
            <p className="text-xs text-gray-400 mt-1">Avg Band: {overview?.avg_writing_band || 0}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Mic className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{overview?.total_speaking_tests || 0}</p>
            <p className="text-sm text-gray-500">Speaking Tests</p>
            <p className="text-xs text-gray-400 mt-1">Avg Band: {overview?.avg_speaking_band || 0}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{overview?.total_reading_tests || 0}</p>
            <p className="text-sm text-gray-500">Reading Tests</p>
            <p className="text-xs text-gray-400 mt-1">Avg Score: {overview?.avg_reading_score || 0}</p>
          </CardBody>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardBody>
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/admin/students" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
              <Users className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Manage Students</p>
            </Link>
            <Link href="/reading" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
              <BookOpen className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Reading Tests</p>
            </Link>
            <Link href="/writing" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
              <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Writing Tests</p>
            </Link>
            <Link href="/speaking" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
              <Mic className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Speaking Tests</p>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
