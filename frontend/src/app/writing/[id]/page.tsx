'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Card, CardBody, CardHeader, Badge, Spinner, Button } from '@/components/ui'
import { formatDate, formatBandScore, formatTime, getBandBgColor } from '@/lib/utils'
import { ArrowLeft, PenTool, Clock, FileText, Lightbulb } from 'lucide-react'
import type { WritingTest } from '@/types'

export default function WritingTestDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [test, setTest] = useState<WritingTest | null>(null)
  const [loading, setLoading] = useState(true)
  const backHref = user?.role === 'admin' ? '/admin/writing' : '/writing'

  useEffect(() => {
    if (params.id) {
      api.getWritingTest(Number(params.id)).then(setTest).catch(console.error).finally(() => setLoading(false))
    }
  }, [params.id])

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>
  if (!test) return <DashboardLayout><p>Test not found</p></DashboardLayout>

  const feedback = test.feedback

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={backHref}><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Writing {test.task_type === 'task1' ? 'Task 1' : 'Task 2'}</h1>
              <p className="text-sm text-gray-500">{formatDate(test.created_at)}</p>
            </div>
          </div>
          <Badge variant={test.status === 'evaluated' ? 'success' : 'warning'}>{test.status}</Badge>
        </div>

        {/* Overall Band Score */}
        {feedback && (
          <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
            <CardBody className="text-center py-8">
              <p className="text-primary-200 text-sm font-medium mb-2">OVERALL BAND SCORE</p>
              <p className="text-6xl font-bold">{formatBandScore(feedback.overall_band)}</p>
              <p className="text-primary-200 text-sm mt-2">out of 9.0</p>
            </CardBody>
          </Card>
        )}

        {/* Score Breakdown */}
        {feedback && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Task Achievement', score: feedback.task_achievement },
              { label: 'Coherence & Cohesion', score: feedback.coherence_cohesion },
              { label: 'Lexical Resource', score: feedback.lexical_resource },
              { label: 'Grammatical Range', score: feedback.grammatical_range },
            ].map((item) => (
              <Card key={item.label}>
                <CardBody className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatBandScore(item.score)}</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-500 rounded-full h-2 transition-all" style={{ width: `${(item.score / 9) * 100}%` }} />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Test Info */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardBody className="text-center"><Clock className="h-5 w-5 text-gray-400 mx-auto mb-1" /><p className="text-lg font-semibold">{formatTime(test.time_spent)}</p><p className="text-xs text-gray-500">Time Spent</p></CardBody></Card>
          <Card><CardBody className="text-center"><FileText className="h-5 w-5 text-gray-400 mx-auto mb-1" /><p className="text-lg font-semibold">{test.word_count}</p><p className="text-xs text-gray-500">Words</p></CardBody></Card>
          <Card><CardBody className="text-center"><PenTool className="h-5 w-5 text-gray-400 mx-auto mb-1" /><p className="text-lg font-semibold">{test.task_type === 'task1' ? 'Task 1' : 'Task 2'}</p><p className="text-xs text-gray-500">Task Type</p></CardBody></Card>
        </div>

        {/* Topic */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Topic</h3></CardHeader>
          <CardBody><p className="text-gray-700 leading-relaxed">{test.topic}</p></CardBody>
        </Card>

        {/* Written Response */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Your Response</h3></CardHeader>
          <CardBody><p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{test.writing_text}</p></CardBody>
        </Card>

        {/* AI Feedback */}
        {feedback && (
          <>
            <Card>
              <CardHeader><h3 className="font-semibold text-gray-900">AI Feedback</h3></CardHeader>
              <CardBody><p className="text-gray-700 leading-relaxed">{feedback.feedback_text}</p></CardBody>
            </Card>
            <Card className="border-accent-200 bg-accent-50">
              <CardBody>
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 text-accent-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-accent-900 mb-1">Improvement Suggestions</h3>
                    <p className="text-accent-800 text-sm leading-relaxed">{feedback.suggestions}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
