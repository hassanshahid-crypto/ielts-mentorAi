'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Button, Card, CardBody } from '@/components/ui'
import { formatTime } from '@/lib/utils'
import { Mic, MicOff, Clock, Send, Play, Square } from 'lucide-react'
import toast from 'react-hot-toast'

const SPEAKING_TOPICS = {
  1: [
    'Let\'s talk about your hometown. Where is your hometown? What do you like most about it?',
    'Let\'s talk about your studies. What are you studying at the moment? Why did you choose this subject?',
    'Let\'s talk about free time. What do you enjoy doing in your free time? How often do you do it?',
  ],
  2: [
    'Describe a book that had a major influence on you. You should say: what the book was, when you read it, what it was about, and explain how it influenced you.',
    'Describe a place you have visited that you particularly liked. You should say: where it was, when you went there, what you did there, and explain why you liked it.',
    'Describe a skill you would like to learn. You should say: what it is, why you want to learn it, how you would learn it, and explain how this skill would benefit you.',
  ],
  3: [
    'We\'ve been talking about books. Do you think reading habits have changed in recent years? How important is reading for children\'s development?',
    'We\'ve been talking about travel. How has tourism changed your country? What are the advantages and disadvantages of tourism?',
    'We\'ve been talking about skills. What skills are most important in today\'s workplace? How has technology changed the skills people need?',
  ],
}

export default function NewSpeakingTestPage() {
  const [part, setPart] = useState<1 | 2 | 3>(1)
  const [topic, setTopic] = useState('')
  const [transcript, setTranscript] = useState('')
  const [recording, setRecording] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [started, setStarted] = useState(false)
  const [testId, setTestId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    const topics = SPEAKING_TOPICS[part]
    setTopic(topics[Math.floor(Math.random() * topics.length)])
  }, [part])

  const startTest = async () => {
    try {
      const test = await api.createSpeakingTest({ topic, part_number: part })
      setTestId(test.id)
      setStarted(true)
      timerRef.current = setInterval(() => setTimeSpent((t) => t + 1), 1000)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const toggleRecording = () => {
    setRecording(!recording)
    if (!recording) {
      toast.success('Recording started! Speak clearly into your microphone.')
    } else {
      toast.success('Recording stopped.')
    }
  }

  const submitTest = async () => {
    if (!testId || !transcript.trim()) {
      toast.error('Please enter your speaking transcript before submitting.')
      return
    }
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)
    try {
      await api.submitSpeakingTest(testId, { transcript, duration: timeSpent })
      toast.success('Test submitted! AI is evaluating your response...')
      router.push(`/speaking/${testId}`)
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IELTS Speaking Test</h1>
          <p className="text-gray-500 mt-1">Practice your speaking skills</p>
        </div>

        {!started ? (
          <Card>
            <CardBody className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Part</label>
                <div className="grid grid-cols-3 gap-3">
                  {([1, 2, 3] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPart(p)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${part === p ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <p className="font-semibold text-gray-900">Part {p}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {p === 1 ? 'Introduction (4-5 min)' : p === 2 ? 'Long Turn (3-4 min)' : 'Discussion (4-5 min)'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-gray-800 leading-relaxed">{topic}</p>
                </div>
              </div>

              <Button size="lg" onClick={startTest} className="w-full" variant="secondary">
                <Mic className="h-5 w-5 mr-2" /> Start Speaking Test
              </Button>
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Timer Bar */}
            <div className="bg-white rounded-lg border p-3 flex items-center justify-between sticky top-16 z-10">
              <span className="text-sm font-medium text-gray-700">Part {part}</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-sm font-medium">{formatTime(timeSpent)}</span>
                </div>
                <Button onClick={submitTest} loading={submitting} size="sm" variant="secondary">
                  <Send className="h-4 w-4 mr-1" /> Submit
                </Button>
              </div>
            </div>

            {/* Topic Card */}
            <Card className="border-green-200 bg-green-50">
              <CardBody>
                <p className="text-sm font-medium text-green-700 mb-2">SPEAKING PART {part}</p>
                <p className="text-gray-800 leading-relaxed">{topic}</p>
              </CardBody>
            </Card>

            {/* Recording Controls */}
            <Card>
              <CardBody className="text-center space-y-4">
                <p className="text-sm text-gray-500">Click to record your response, or type your transcript below</p>
                <button
                  onClick={toggleRecording}
                  className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center transition-all ${
                    recording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {recording ? <Square className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
                </button>
                <p className="text-xs text-gray-400">
                  {recording ? 'Recording... Click to stop' : 'Click to start recording'}
                </p>
              </CardBody>
            </Card>

            {/* Transcript */}
            <Card>
              <CardBody>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transcript</label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Type or paste your speaking transcript here... (The transcript of what you spoke)"
                  className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 leading-relaxed"
                />
                <p className="text-xs text-gray-400 mt-2">Words: {transcript.trim() ? transcript.trim().split(/\s+/).length : 0}</p>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
