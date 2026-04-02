'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Button, Card, CardBody } from '@/components/ui'
import { formatTime } from '@/lib/utils'
import { Clock, Send, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const WRITING_TOPICS: Record<string, { task1: string[]; task2: string[] }> = {
  beginner: {
    task1: [
      'The table below shows the number of students in three different schools from 2015 to 2020. Summarize the information by selecting and reporting the main features.',
      'The pie chart below shows how people in a town travel to work. Summarize the information by selecting and reporting the main features.',
      'The bar chart below shows the amount of money spent on food in three countries. Summarize the information by selecting and reporting the main features.',
    ],
    task2: [
      'Some people think that children should start learning a foreign language at primary school. To what extent do you agree or disagree?',
      'Many people prefer to watch films at home rather than in a cinema. Why is this? Do you think this is a positive or negative development?',
      'Some people believe that playing sports is the best way for children to stay healthy. Others think there are other ways. Discuss both views and give your opinion.',
    ],
  },
  intermediate: {
    task1: [
      'The bar chart below shows the percentage of people who ate five portions of fruit and vegetables per day in the UK from 2001 to 2008. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      'The two maps below show an island before and after the construction of some tourist facilities. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      'The graph below shows the proportion of the population aged 65 and over between 1940 and 2040 in three different countries. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    ],
    task2: [
      'Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion.',
      'In many countries, the amount of crime is increasing. What do you think are the main causes of crime? What solutions can you suggest?',
      'Some people believe that unpaid community service should be a compulsory part of high school programs. To what extent do you agree or disagree?',
    ],
  },
  pro: {
    task1: [
      'The diagram below shows the process of manufacturing cement and how it is used to produce concrete for building purposes. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      'The charts below show the percentage of water used for different purposes in six areas of the world. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      'The line graph below shows changes in the birth and death rates in New Zealand between 1901 and 2101. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    ],
    task2: [
      'Some people argue that governments should invest more in disease prevention rather than treatment. To what extent do you agree or disagree? Provide specific examples and evidence to support your argument.',
      'The rise of artificial intelligence raises questions about the future of employment. Some believe AI will create more jobs than it destroys, while others predict widespread unemployment. Discuss both perspectives and present a well-reasoned argument.',
      'Environmental sustainability and economic growth are often seen as conflicting goals. Some argue that countries must prioritize economic development over environmental concerns. Critically evaluate this statement with reference to specific examples.',
    ],
  },
}

export default function NewWritingTestPage() {
  const { user } = useAuth()
  const [taskType, setTaskType] = useState<'task1' | 'task2'>('task2')
  const [topic, setTopic] = useState('')
  const [text, setText] = useState('')
  const [timeSpent, setTimeSpent] = useState(0)
  const [started, setStarted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [testId, setTestId] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const difficulty = user?.difficulty_level || 'intermediate'
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const timeLimit = taskType === 'task1' ? 20 * 60 : 40 * 60

  useEffect(() => {
    if (user?.role === 'admin') { router.push('/admin/writing'); return }
  }, [user, router])

  useEffect(() => {
    const topics = WRITING_TOPICS[difficulty]?.[taskType] || WRITING_TOPICS['intermediate'][taskType]
    setTopic(topics[Math.floor(Math.random() * topics.length)])
  }, [taskType, difficulty])

  const startTest = async () => {
    try {
      const test = await api.createWritingTest({ task_type: taskType, topic })
      setTestId(test.id)
      setStarted(true)
      timerRef.current = setInterval(() => setTimeSpent((t) => t + 1), 1000)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const submitTest = async () => {
    if (!testId || !text.trim()) {
      toast.error('Please write your response before submitting.')
      return
    }
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)
    try {
      await api.submitWritingTest(testId, { writing_text: text, time_spent: timeSpent })
      toast.success('Test submitted! AI is evaluating your response...')
      router.push(`/writing/${testId}`)
    } catch (err: any) {
      toast.error(err.message)
      setSubmitting(false)
    }
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">IELTS Writing Test</h1>
          <p className="text-gray-500 mt-1">Complete the writing task below &bull; <span className="capitalize">{difficulty}</span> level</p>
        </div>

        {!started ? (
          <Card className="rounded-2xl border-gray-100 shadow-soft">
            <CardBody className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Task Type</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setTaskType('task1')}
                    className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${taskType === 'task1' ? 'border-primary-500 bg-primary-50 shadow-sm shadow-primary-100' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <p className="font-semibold text-gray-900">Task 1</p>
                    <p className="text-sm text-gray-500 mt-1">Report / Letter writing (20 min, 150+ words)</p>
                  </button>
                  <button
                    onClick={() => setTaskType('task2')}
                    className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${taskType === 'task2' ? 'border-primary-500 bg-primary-50 shadow-sm shadow-primary-100' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <p className="font-semibold text-gray-900">Task 2</p>
                    <p className="text-sm text-gray-500 mt-1">Essay writing (40 min, 250+ words)</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-100">
                  <p className="text-gray-800 leading-relaxed">{topic}</p>
                </div>
              </div>

              <Button size="lg" onClick={startTest} className="w-full rounded-xl">
                <FileText className="h-5 w-5 mr-2" /> Start Writing Test
              </Button>
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Timer Bar */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex items-center justify-between sticky top-16 z-10">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">{taskType === 'task1' ? 'Task 1' : 'Task 2'}</span>
                <span className="text-sm text-gray-500">Words: <strong className="text-gray-700">{wordCount}</strong> / {taskType === 'task1' ? '150+' : '250+'}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-1.5 ${timeSpent > timeLimit ? 'text-red-600' : 'text-gray-700'}`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-sm font-medium">{formatTime(timeSpent)}</span>
                  <span className="text-xs text-gray-400">/ {formatTime(timeLimit)}</span>
                </div>
                <Button onClick={submitTest} loading={submitting} size="sm" className="rounded-xl">
                  <Send className="h-4 w-4 mr-1" /> Submit
                </Button>
              </div>
            </div>

            {/* Topic */}
            <Card className="rounded-2xl border-gray-100 shadow-soft">
              <CardBody>
                <p className="text-sm font-medium text-primary-600 mb-2 tracking-wide">WRITING {taskType.toUpperCase()}</p>
                <p className="text-gray-800 leading-relaxed">{topic}</p>
              </CardBody>
            </Card>

            {/* Text Editor */}
            <Card className="rounded-2xl border-gray-100 shadow-soft">
              <CardBody>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start writing your response here..."
                  className="w-full h-96 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-gray-900 leading-relaxed transition-all"
                  autoFocus
                />
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
