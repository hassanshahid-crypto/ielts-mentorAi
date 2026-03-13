'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Card, CardBody, Badge, Button, Spinner } from '@/components/ui'
import { formatDate, formatBandScore } from '@/lib/utils'
import { Mic, Plus, Filter } from 'lucide-react'
import type { SpeakingTest } from '@/types'

export default function SpeakingPage() {
  const [tests, setTests] = useState<SpeakingTest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    api.getSpeakingTests(filter ? Number(filter) : undefined).then(setTests).catch(console.error).finally(() => setLoading(false))
  }, [filter])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Speaking Practice</h1>
            <p className="text-gray-500 mt-1">Practice IELTS Speaking Parts 1, 2 & 3</p>
          </div>
          <Link href="/speaking/new">
            <Button><Plus className="h-4 w-4 mr-2" /> New Speaking Test</Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Parts</option>
            <option value="1">Part 1</option>
            <option value="2">Part 2</option>
            <option value="3">Part 3</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : tests.length === 0 ? (
          <Card>
            <CardBody className="text-center py-16">
              <Mic className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Speaking Tests Yet</h3>
              <p className="text-gray-500 mb-4">Start your first speaking practice session</p>
              <Link href="/speaking/new"><Button>Start Speaking Test</Button></Link>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <Link key={test.id} href={`/speaking/${test.id}`}>
                <Card hover className="cursor-pointer">
                  <CardBody className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Mic className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">Part {test.part_number}</h3>
                          <Badge variant={test.status === 'evaluated' ? 'success' : 'warning'}>{test.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{test.topic}</p>
                        <p className="text-xs text-gray-400">{formatDate(test.created_at)}</p>
                      </div>
                    </div>
                    {test.feedback && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{formatBandScore(test.feedback.overall_band)}</p>
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
