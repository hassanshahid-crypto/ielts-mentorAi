'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Card, CardBody, Badge, Spinner } from '@/components/ui'
import { formatDate, formatBandScore } from '@/lib/utils'
import { PenTool, Mic, BookOpen, Trophy } from 'lucide-react'
import type { WritingTest, SpeakingTest, ReadingTest } from '@/types'

type ResultItem = {
  id: number
  type: 'writing' | 'speaking' | 'reading'
  title: string
  score: number
  date: string
  status: string
  href: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'writing' | 'speaking' | 'reading'>('all')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [writing, speaking, reading] = await Promise.all([
          api.getWritingTests(),
          api.getSpeakingTests(),
          api.getReadingHistory(),
        ])

        const items: ResultItem[] = [
          ...writing.filter(t => t.status === 'evaluated').map(t => ({
            id: t.id, type: 'writing' as const,
            title: `Writing ${t.task_type === 'task1' ? 'Task 1' : 'Task 2'}`,
            score: t.feedback?.overall_band || 0,
            date: t.created_at, status: t.status, href: `/writing/${t.id}`,
          })),
          ...speaking.filter(t => t.status === 'evaluated').map(t => ({
            id: t.id, type: 'speaking' as const,
            title: `Speaking Part ${t.part_number}`,
            score: t.feedback?.overall_band || 0,
            date: t.created_at, status: t.status, href: `/speaking/${t.id}`,
          })),
          ...reading.map(t => ({
            id: t.id, type: 'reading' as const,
            title: `Reading: ${t.passage_title}`,
            score: t.score, date: t.created_at, status: t.status,
            href: `/reading/${t.passage}`,
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setResults(items)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filtered = tab === 'all' ? results : results.filter(r => r.type === tab)
  const icons = { writing: PenTool, speaking: Mic, reading: BookOpen }
  const colors = { writing: 'blue', speaking: 'green', reading: 'purple' }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
          <p className="text-gray-500 mt-1">View all your test results and scores</p>
        </div>

        <div className="flex space-x-2 border-b">
          {(['all', 'writing', 'speaking', 'reading'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardBody className="text-center py-16">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
              <p className="text-gray-500">Complete some tests to see your results here</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const Icon = icons[item.type]
              const color = colors[item.type]
              return (
                <Link key={`${item.type}-${item.id}`} href={item.href}>
                  <Card hover className="cursor-pointer">
                    <CardBody className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`h-10 w-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 text-${color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary-600">{formatBandScore(item.score)}</p>
                        <p className="text-xs text-gray-500">Band</p>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
