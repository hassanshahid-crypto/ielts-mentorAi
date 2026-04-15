'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Card, CardBody, Badge, Button, Spinner } from '@/components/ui'
import { formatDate, formatBandScore, getBandBgColor } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { PenTool, Plus, Filter } from 'lucide-react'
import type { WritingTest } from '@/types'

export default function WritingPage() {
  const { user } = useAuth()
  const [tests, setTests] = useState<WritingTest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    api.getWritingTests(filter || undefined).then(setTests).catch(console.error).finally(() => setLoading(false))
  }, [filter])

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-display font-bold text-gray-900">Writing Practice</h1>
            <p className="text-gray-500 mt-1">{user?.role === 'admin' ? 'Manage all writing tests' : 'Your IELTS Writing practice history'}</p>
          </div>
          {user?.role === 'student' && (
            <Link href="/writing/new" className="flex-shrink-0">
              <Button className="rounded-xl w-full sm:w-auto"><Plus className="h-4 w-4 mr-2" /> Practice Now</Button>
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:outline-none hover:border-gray-300 transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Tasks</option>
            <option value="task1">Task 1</option>
            <option value="task2">Task 2</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : tests.length === 0 ? (
          <Card className="rounded-2xl border-gray-100 shadow-soft">
            <CardBody className="text-center py-20">
              <div className="h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <PenTool className="h-8 w-8 text-primary-400" />
              </div>
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">No Writing Tests Yet</h3>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">Start your first writing practice to get AI feedback on your IELTS essays</p>
              <Link href="/writing/new"><Button className="rounded-xl">Start Writing Test</Button></Link>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4 animate-slide-up">
            {tests.map((test) => (
              <Link key={test.id} href={`/writing/${test.id}`}>
                <Card hover className="cursor-pointer rounded-2xl border-gray-100 shadow-soft hover:shadow-soft-lg transition-all">
                  <CardBody className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-11 w-11 bg-primary-50 rounded-xl flex items-center justify-center">
                        <PenTool className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{test.task_type === 'task1' ? 'Task 1' : 'Task 2'}</h3>
                          <Badge
                            variant={test.status === 'evaluated' ? 'success' : test.status === 'submitted' ? 'info' : 'default'}
                            className="rounded-lg ring-1 ring-inset"
                          >
                            {test.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{test.topic}</p>
                        <p className="text-xs text-gray-400">{formatDate(test.created_at)} &bull; {test.word_count} words</p>
                      </div>
                    </div>
                    {test.feedback && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">{formatBandScore(test.feedback.overall_band)}</p>
                        <p className="text-xs text-gray-500">Band Score</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
