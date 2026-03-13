'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Card, CardBody, Badge, Spinner } from '@/components/ui'
import { formatDate, formatBandScore, getBandBgColor } from '@/lib/utils'
import { PenTool, Mic, BookOpen, TrendingUp, Target, Award, ArrowRight } from 'lucide-react'
import type { DashboardStats } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboard().then(setStats).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your IELTS preparation overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tests</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_tests || 0}</p>
              </div>
              <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overall Average</p>
                <p className="text-3xl font-bold text-gray-900">{formatBandScore(stats?.overall_avg || 0)}</p>
              </div>
              <div className="h-12 w-12 bg-accent-50 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-accent-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Writing Band</p>
                <p className="text-3xl font-bold text-gray-900">{formatBandScore(stats?.writing_avg_band || 0)}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <PenTool className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Speaking Band</p>
                <p className="text-3xl font-bold text-gray-900">{formatBandScore(stats?.speaking_avg_band || 0)}</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Mic className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/writing/new">
            <Card hover className="cursor-pointer">
              <CardBody className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PenTool className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Writing Test</h3>
                  <p className="text-sm text-gray-500">Task 1 or Task 2</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </CardBody>
            </Card>
          </Link>
          <Link href="/speaking/new">
            <Card hover className="cursor-pointer">
              <CardBody className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mic className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Speaking Test</h3>
                  <p className="text-sm text-gray-500">Part 1, 2 or 3</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </CardBody>
            </Card>
          </Link>
          <Link href="/reading">
            <Card hover className="cursor-pointer">
              <CardBody className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Reading Test</h3>
                  <p className="text-sm text-gray-500">Practice passages</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <h3 className="font-semibold text-gray-900 mb-4">Recent Writing Tests</h3>
            {stats?.recent_writing && stats.recent_writing.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_writing.map((test: any) => (
                  <Link key={test.id} href={`/writing/${test.id}`} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2">
                    <div className="flex items-center space-x-3">
                      <PenTool className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{test.task_type === 'task1' ? 'Task 1' : 'Task 2'}</p>
                        <p className="text-xs text-gray-500">{formatDate(test.created_at)}</p>
                      </div>
                    </div>
                    <Badge variant={test.status === 'evaluated' ? 'success' : 'warning'}>{test.status}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No writing tests yet. Start your first test!</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="font-semibold text-gray-900 mb-4">Recent Reading Tests</h3>
            {stats?.recent_reading && stats.recent_reading.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_reading.map((test: any) => (
                  <div key={test.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{test.passage__title || 'Reading Test'}</p>
                        <p className="text-xs text-gray-500">{formatDate(test.created_at)}</p>
                      </div>
                    </div>
                    <Badge variant={test.score >= 6 ? 'success' : 'warning'}>{formatBandScore(test.score)}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No reading tests yet. Start practicing!</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
