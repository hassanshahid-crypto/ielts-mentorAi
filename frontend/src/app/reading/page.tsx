'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Card, CardBody, Badge, Button, Spinner } from '@/components/ui'
import { BookOpen, Filter } from 'lucide-react'
import type { ReadingPassage } from '@/types'

export default function ReadingPage() {
  const [passages, setPassages] = useState<ReadingPassage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.getReadingPassages(filter || undefined).then(setPassages).catch(console.error).finally(() => setLoading(false))
  }, [filter])

  const difficultyVariant = (d: string) => d === 'beginner' ? 'success' : d === 'intermediate' ? 'warning' : 'danger'

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Reading Practice</h1>
          <p className="text-gray-500 mt-1">Practice with IELTS reading passages and questions</p>
        </div>

        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:outline-none hover:border-gray-300 transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">My Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="pro">Pro</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : passages.length === 0 ? (
          <Card className="rounded-2xl border-gray-100">
            <CardBody className="text-center py-20 px-8">
              <div className="bg-gray-50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <BookOpen className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold font-display text-gray-900 mb-2">No Reading Passages Available</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">Ask your admin to add reading passages to the system.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {passages.map((passage) => (
              <Card key={passage.id} hover className="rounded-2xl border-gray-100 shadow-soft animate-slide-up">
                <CardBody className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-purple-50 h-9 w-9 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-4.5 w-4.5 text-purple-600" />
                      </div>
                      <Badge variant={difficultyVariant(passage.difficulty)} className="rounded-lg ring-1 ring-inset">{passage.difficulty}</Badge>
                    </div>
                    {passage.category && <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">{passage.category}</span>}
                  </div>
                  <h3 className="font-semibold font-display text-gray-900 mb-2">{passage.title}</h3>
                  <p className="text-sm text-gray-400 mb-5">{passage.question_count || 0} questions</p>
                  <Link href={`/reading/${passage.id}`}>
                    <Button variant="outline" size="sm" className="w-full rounded-xl">Start Test</Button>
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
