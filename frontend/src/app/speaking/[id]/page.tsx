'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Card, CardBody, CardHeader, Badge, Spinner, Button } from '@/components/ui'
import { formatDate, formatBandScore, formatTime } from '@/lib/utils'
import { ArrowLeft, Mic, Clock, Lightbulb } from 'lucide-react'
import type { SpeakingTest } from '@/types'

export default function SpeakingTestDetailPage() {
  const params = useParams()
  const [test, setTest] = useState<SpeakingTest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      api.getSpeakingTest(Number(params.id)).then(setTest).catch(console.error).finally(() => setLoading(false))
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
            <Link href="/speaking"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Speaking Part {test.part_number}</h1>
              <p className="text-sm text-gray-500">{formatDate(test.created_at)}</p>
            </div>
          </div>
          <Badge variant={test.status === 'evaluated' ? 'success' : 'warning'}>{test.status}</Badge>
        </div>

        {/* Overall Band */}
        {feedback && (
          <Card className="bg-gradient-to-r from-green-600 to-green-800 text-white">
            <CardBody className="text-center py-8">
              <p className="text-green-200 text-sm font-medium mb-2">OVERALL BAND SCORE</p>
              <p className="text-6xl font-bold">{formatBandScore(feedback.overall_band)}</p>
              <p className="text-green-200 text-sm mt-2">out of 9.0</p>
            </CardBody>
          </Card>
        )}

        {/* Score Breakdown */}
        {feedback && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Pronunciation', score: feedback.pronunciation_score },
              { label: 'Fluency', score: feedback.fluency_score },
              { label: 'Grammar', score: feedback.grammar_score },
              { label: 'Coherence', score: feedback.coherence_score },
              { label: 'Vocabulary', score: feedback.vocabulary_score },
            ].map((item) => (
              <Card key={item.label}>
                <CardBody className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-xl font-bold text-gray-900">{formatBandScore(item.score)}</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: `${(item.score / 9) * 100}%` }} />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card><CardBody className="text-center"><Clock className="h-5 w-5 text-gray-400 mx-auto mb-1" /><p className="text-lg font-semibold">{formatTime(test.duration)}</p><p className="text-xs text-gray-500">Duration</p></CardBody></Card>
          <Card><CardBody className="text-center"><Mic className="h-5 w-5 text-gray-400 mx-auto mb-1" /><p className="text-lg font-semibold">Part {test.part_number}</p><p className="text-xs text-gray-500">Speaking Part</p></CardBody></Card>
        </div>

        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Topic</h3></CardHeader>
          <CardBody><p className="text-gray-700 leading-relaxed">{test.topic}</p></CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Transcript</h3></CardHeader>
          <CardBody><p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{test.transcript || 'No transcript available'}</p></CardBody>
        </Card>

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
