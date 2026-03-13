'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Card, CardBody, Badge, Button, Spinner } from '@/components/ui'
import { formatDate, formatBandScore, getBandBgColor } from '@/lib/utils'
import { PenTool, Plus, Filter } from 'lucide-react'
import type { WritingTest } from '@/types'

export default function WritingPage() {
  const [tests, setTests] = useState<WritingTest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    api.getWritingTests(filter || undefined).then(setTests).catch(console.error).finally(() => setLoading(false))
  }, [filter])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Writing Practice</h1>
            <p className="text-gray-500 mt-1">Practice IELTS Writing Task 1 & Task 2</p>
          </div>
          <Link href="/writing/new">
            <Button><Plus className="h-4 w-4 mr-2" /> New Writing Test</Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500"
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
          <Card>
            <CardBody className="text-center py-16">
              <PenTool className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Writing Tests Yet</h3>
              <p className="text-gray-500 mb-4">Start your first writing practice to get AI feedback</p>
              <Link href="/writing/new"><Button>Start Writing Test</Button></Link>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <Link key={test.id} href={`/writing/${test.id}`}>
                <Card hover className="cursor-pointer">
                  <CardBody className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <PenTool className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{test.task_type === 'task1' ? 'Task 1' : 'Task 2'}</h3>
                          <Badge variant={test.status === 'evaluated' ? 'success' : test.status === 'submitted' ? 'info' : 'default'}>
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
