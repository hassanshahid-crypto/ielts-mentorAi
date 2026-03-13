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

  const difficultyVariant = (d: string) => d === 'easy' ? 'success' : d === 'medium' ? 'warning' : 'danger'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reading Practice</h1>
          <p className="text-gray-500 mt-1">Practice with IELTS reading passages and questions</p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : passages.length === 0 ? (
          <Card>
            <CardBody className="text-center py-16">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reading Passages Available</h3>
              <p className="text-gray-500">Ask your admin to add reading passages to the system.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {passages.map((passage) => (
              <Card key={passage.id} hover>
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <Badge variant={difficultyVariant(passage.difficulty)}>{passage.difficulty}</Badge>
                    </div>
                    {passage.category && <span className="text-xs text-gray-500">{passage.category}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{passage.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{passage.question_count || 0} questions</p>
                  <Link href={`/reading/${passage.id}`}>
                    <Button variant="outline" size="sm" className="w-full">Start Test</Button>
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
