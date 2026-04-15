'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Card, CardBody, CardHeader, Badge, Button, Spinner } from '@/components/ui'
import { formatTime, formatBandScore } from '@/lib/utils'
import { ArrowLeft, Clock, Send, CheckCircle, XCircle, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ReadingPassage, ReadingQuestion, ReadingTest } from '@/types'

export default function ReadingTestPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const backHref = user?.role === 'admin' ? '/admin/reading' : '/reading'
  const [passage, setPassage] = useState<ReadingPassage | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [testId, setTestId] = useState<number | null>(null)
  const [timeSpent, setTimeSpent] = useState(0)
  const [started, setStarted] = useState(false)
  const [result, setResult] = useState<ReadingTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (params.id) {
      api.getReadingPassage(Number(params.id)).then(setPassage).catch(console.error).finally(() => setLoading(false))
    }
  }, [params.id])

  const startTest = async () => {
    if (!passage) return
    try {
      const test = await api.startReadingTest(passage.id)
      setTestId(test.id)
      setStarted(true)
      timerRef.current = setInterval(() => setTimeSpent((t) => t + 1), 1000)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const submitTest = async () => {
    if (!testId) return
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)
    try {
      const res = await api.submitReadingTest(testId, { answers, time_spent: timeSpent })
      setResult(res)
      toast.success(`Test completed! Score: ${formatBandScore(res.score)}/9.0`)
    } catch (err: any) {
      toast.error(err.message)
      setSubmitting(false)
    }
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>
  if (!passage) return <DashboardLayout><p>Passage not found</p></DashboardLayout>

  const questions = passage.questions || []

  // Result View
  if (result) {
    const resultQuestions = result.questions || []
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center space-x-3">
            <Link href={backHref}><Button variant="ghost" size="sm" className="rounded-xl"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
            <h1 className="text-xl font-bold font-display text-gray-900">Test Results</h1>
          </div>

          <Card className="rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white shadow-soft-lg border-0 overflow-hidden">
            <CardBody className="text-center py-10 relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
              <div className="relative">
                <p className="text-purple-200 text-sm font-medium tracking-wide uppercase mb-3">Reading Score</p>
                <p className="text-7xl font-bold font-display">{formatBandScore(result.score)}</p>
                <p className="text-purple-200 text-sm mt-3">{result.correct_answers}/{result.total_questions} correct &bull; Time: {formatTime(result.time_spent)}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="rounded-2xl border-gray-100 shadow-soft">
            <CardHeader><h3 className="font-semibold font-display text-gray-900">Answer Review</h3></CardHeader>
            <CardBody className="space-y-4">
              {resultQuestions.map((q, i) => {
                const userAnswer = result.answers[String(q.id)] || ''
                const isCorrect = userAnswer.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim()
                return (
                  <div key={q.id} className={`p-5 rounded-xl border transition-all ${isCorrect ? 'border-green-200 bg-green-50/60' : 'border-red-200 bg-red-50/60'}`}>
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-gray-900 text-sm">Q{i + 1}. {q.question_text}</p>
                      {isCorrect ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
                    </div>
                    <div className="mt-3 text-sm space-y-1.5">
                      <p><span className="text-gray-500">Your answer:</span> <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>{userAnswer || '(no answer)'}</span></p>
                      {!isCorrect && <p><span className="text-gray-500">Correct answer:</span> <span className="text-green-700 font-medium">{q.correct_answer}</span></p>}
                      {q.explanation && <p className="text-gray-400 text-xs mt-2 leading-relaxed">{q.explanation}</p>}
                    </div>
                  </div>
                )
              })}
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Test View
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {!started ? (
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-2xl border-gray-100 shadow-soft">
              <CardBody className="text-center py-14 px-8 space-y-5">
                <div className="bg-purple-50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold font-display text-gray-900">{passage.title}</h2>
                <Badge variant={passage.difficulty === 'beginner' ? 'success' : passage.difficulty === 'intermediate' ? 'warning' : 'danger'} className="rounded-lg ring-1 ring-inset">{passage.difficulty}</Badge>
                <p className="text-gray-400">{questions.length} questions &bull; Approximately 20 minutes</p>
                <Button size="lg" onClick={startTest} className="rounded-xl">Start Reading Test</Button>
              </CardBody>
            </Card>
          </div>
        ) : (
          <>
            {/* Timer */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between sticky top-16 z-10 shadow-soft">
              <span className="text-sm font-semibold font-display text-gray-700">{passage.title}</span>
              <div className="flex items-center space-x-5">
                <span className="text-sm text-gray-400">Answered: <span className="text-gray-700 font-medium">{Object.keys(answers).length}/{questions.length}</span></span>
                <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1.5 rounded-xl text-gray-700">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-mono text-sm font-medium">{formatTime(timeSpent)}</span>
                </div>
                <Button onClick={submitTest} loading={submitting} size="sm" className="rounded-xl"><Send className="h-4 w-4 mr-1" /> Submit</Button>
              </div>
            </div>

            {/* Split View */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Passage */}
              <Card className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto rounded-2xl border-gray-100 shadow-soft">
                <CardHeader><h3 className="font-semibold font-display text-gray-900">{passage.title}</h3></CardHeader>
                <CardBody>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{passage.passage_text}</p>
                </CardBody>
              </Card>

              {/* Questions */}
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <Card key={q.id} className="rounded-2xl border-gray-100 shadow-soft animate-slide-up">
                    <CardBody className="p-5">
                      <div className="flex items-start space-x-3 mb-4">
                        <span className="bg-primary-100 text-primary-700 rounded-xl h-7 w-7 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                        <div>
                          <Badge variant="info" className="mb-1.5 rounded-lg ring-1 ring-inset">{q.question_type.replace('_', ' ')}</Badge>
                          <p className="text-sm font-medium text-gray-900">{q.question_text}</p>
                        </div>
                      </div>

                      {q.question_type === 'mcq' && q.options ? (
                        <div className="space-y-2 ml-10">
                          {q.options.map((opt: string, j: number) => (
                            <label key={j} className="flex items-center space-x-3 cursor-pointer p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                value={opt}
                                checked={answers[String(q.id)] === opt}
                                onChange={() => setAnswers({ ...answers, [String(q.id)]: opt })}
                                className="text-primary-600"
                              />
                              <span className="text-sm text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : q.question_type === 'true_false_ng' ? (
                        <div className="flex space-x-3 ml-10">
                          {['True', 'False', 'Not Given'].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setAnswers({ ...answers, [String(q.id)]: opt.toLowerCase() })}
                              className={`px-5 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                                answers[String(q.id)] === opt.toLowerCase()
                                  ? 'bg-primary-600 text-white border-primary-600 shadow-soft'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="Type your answer..."
                          value={answers[String(q.id)] || ''}
                          onChange={(e) => setAnswers({ ...answers, [String(q.id)]: e.target.value })}
                          className="ml-10 w-full max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:outline-none hover:border-gray-300 transition-all"
                        />
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
