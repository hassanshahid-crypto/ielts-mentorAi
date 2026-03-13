'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Card, CardBody, CardHeader, Badge, Button, Spinner } from '@/components/ui'
import { formatTime, formatBandScore } from '@/lib/utils'
import { ArrowLeft, Clock, Send, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ReadingPassage, ReadingQuestion, ReadingTest } from '@/types'

export default function ReadingTestPage() {
  const params = useParams()
  const router = useRouter()
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-3">
            <Link href="/reading"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
            <h1 className="text-xl font-bold text-gray-900">Test Results</h1>
          </div>

          <Card className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
            <CardBody className="text-center py-8">
              <p className="text-purple-200 text-sm font-medium mb-2">READING SCORE</p>
              <p className="text-6xl font-bold">{formatBandScore(result.score)}</p>
              <p className="text-purple-200 text-sm mt-2">{result.correct_answers}/{result.total_questions} correct &bull; Time: {formatTime(result.time_spent)}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-semibold">Answer Review</h3></CardHeader>
            <CardBody className="space-y-4">
              {resultQuestions.map((q, i) => {
                const userAnswer = result.answers[String(q.id)] || ''
                const isCorrect = userAnswer.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim()
                return (
                  <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-gray-900 text-sm">Q{i + 1}. {q.question_text}</p>
                      {isCorrect ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
                    </div>
                    <div className="mt-2 text-sm space-y-1">
                      <p><span className="text-gray-500">Your answer:</span> <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>{userAnswer || '(no answer)'}</span></p>
                      {!isCorrect && <p><span className="text-gray-500">Correct answer:</span> <span className="text-green-700 font-medium">{q.correct_answer}</span></p>}
                      {q.explanation && <p className="text-gray-500 text-xs mt-1">{q.explanation}</p>}
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
      <div className="space-y-6">
        {!started ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardBody className="text-center py-10 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">{passage.title}</h2>
                <Badge variant={passage.difficulty === 'easy' ? 'success' : passage.difficulty === 'medium' ? 'warning' : 'danger'}>{passage.difficulty}</Badge>
                <p className="text-gray-500">{questions.length} questions &bull; Approximately 20 minutes</p>
                <Button size="lg" onClick={startTest}>Start Reading Test</Button>
              </CardBody>
            </Card>
          </div>
        ) : (
          <>
            {/* Timer */}
            <div className="bg-white rounded-lg border p-3 flex items-center justify-between sticky top-16 z-10">
              <span className="text-sm font-medium text-gray-700">{passage.title}</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Answered: {Object.keys(answers).length}/{questions.length}</span>
                <div className="flex items-center space-x-1 text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-sm">{formatTime(timeSpent)}</span>
                </div>
                <Button onClick={submitTest} loading={submitting} size="sm"><Send className="h-4 w-4 mr-1" /> Submit</Button>
              </div>
            </div>

            {/* Split View */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Passage */}
              <Card className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto">
                <CardHeader><h3 className="font-semibold text-gray-900">{passage.title}</h3></CardHeader>
                <CardBody>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{passage.passage_text}</p>
                </CardBody>
              </Card>

              {/* Questions */}
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <Card key={q.id}>
                    <CardBody>
                      <div className="flex items-start space-x-2 mb-3">
                        <span className="bg-primary-100 text-primary-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                        <div>
                          <Badge variant="info" className="mb-1">{q.question_type.replace('_', ' ')}</Badge>
                          <p className="text-sm font-medium text-gray-900">{q.question_text}</p>
                        </div>
                      </div>

                      {q.question_type === 'mcq' && q.options ? (
                        <div className="space-y-2 ml-8">
                          {q.options.map((opt: string, j: number) => (
                            <label key={j} className="flex items-center space-x-2 cursor-pointer">
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
                        <div className="flex space-x-3 ml-8">
                          {['True', 'False', 'Not Given'].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setAnswers({ ...answers, [String(q.id)]: opt.toLowerCase() })}
                              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                                answers[String(q.id)] === opt.toLowerCase()
                                  ? 'bg-primary-600 text-white border-primary-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
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
                          className="ml-8 w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
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
