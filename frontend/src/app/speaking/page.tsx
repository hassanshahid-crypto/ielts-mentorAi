'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Card, CardBody, Badge, Button, Spinner } from '@/components/ui'
import { formatDate, formatBandScore } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Mic, Plus, Filter } from 'lucide-react'
import type { SpeakingTest } from '@/types'

export default function SpeakingPage() {
  const { user } = useAuth()
  const [tests, setTests] = useState<SpeakingTest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    api.getSpeakingTests(filter ? Number(filter) : undefined).then(setTests).catch(console.error).finally(() => setLoading(false))
  }, [filter])

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-display font-bold text-gray-900">Speaking Practice</h1>
            <p className="text-gray-500 mt-1">{user?.role === 'admin' ? 'Manage all speaking tests' : 'Your IELTS Speaking practice history'}</p>
          </div>
          {user?.role === 'student' && (
            <Link href="/speaking/new" className="flex-shrink-0">
              <Button variant="secondary" className="rounded-xl w-full sm:w-auto"><Plus className="h-4 w-4 mr-2" /> Practice Now</Button>
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
            <option value="">All Parts</option>
            <option value="1">Part 1</option>
            <option value="2">Part 2</option>
            <option value="3">Part 3</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : tests.length === 0 ? (
          <Card className="rounded-2xl border-gray-100">
            <CardBody className="text-center py-20">
              <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Mic className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">No Speaking Tests Yet</h3>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">Start your first speaking practice session and improve your IELTS score</p>
              <Link href="/speaking/new"><Button className="rounded-xl">Start Speaking Test</Button></Link>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4 animate-slide-up">
            {tests.map((test) => (
              <Link key={test.id} href={`/speaking/${test.id}`}>
                <Card hover className="cursor-pointer rounded-2xl border-gray-100 shadow-soft hover:shadow-soft-lg transition-all">
                  <CardBody className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-11 w-11 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <Mic className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">Part {test.part_number}</h3>
                          <Badge variant={test.status === 'evaluated' ? 'success' : 'warning'} className="rounded-lg ring-1 ring-inset">{test.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{test.topic}</p>
                        <p className="text-xs text-gray-400">{formatDate(test.created_at)}</p>
                      </div>
                    </div>
                    {test.feedback && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">{formatBandScore(test.feedback.overall_band)}</p>
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
