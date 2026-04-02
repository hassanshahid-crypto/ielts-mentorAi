'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Button, Card, CardBody } from '@/components/ui'
import { formatTime } from '@/lib/utils'
import { Mic, MicOff, Clock, Send, Square } from 'lucide-react'
import toast from 'react-hot-toast'

const SPEAKING_TOPICS: Record<string, Record<number, string[]>> = {
  beginner: {
    1: [
      'Let\'s talk about your hometown. Where is it? What do you like about it?',
      'Let\'s talk about food. What is your favourite food? Do you like cooking?',
      'Let\'s talk about your daily routine. What do you usually do in the morning?',
    ],
    2: [
      'Describe a friend who is important to you. You should say: who this person is, how you met, what you do together, and explain why this person is important to you.',
      'Describe your favourite place in your city. You should say: where it is, how often you go there, what you do there, and explain why you like it.',
      'Describe a hobby you enjoy. You should say: what it is, when you started, how often you do it, and explain why you enjoy it.',
    ],
    3: [
      'We\'ve been talking about friends. What makes a good friend? Do you think friendships change as people get older?',
      'We\'ve been talking about places. What makes a city a good place to live? How are cities changing in your country?',
      'We\'ve been talking about hobbies. Why are hobbies important for people? What hobbies are popular in your country?',
    ],
  },
  intermediate: {
    1: [
      'Let\'s talk about your studies. What are you studying at the moment? Why did you choose this subject?',
      'Let\'s talk about technology. How often do you use the Internet? What do you use it for?',
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
  },
  pro: {
    1: [
      'Let\'s talk about media. How do you get your news? Do you think social media has changed how people consume information?',
      'Let\'s talk about the environment. Are people in your country concerned about environmental issues? What do you personally do to protect the environment?',
      'Let\'s talk about education. How has education changed in your country in recent years? What improvements would you suggest?',
    ],
    2: [
      'Describe a time when you had to make a difficult decision. You should say: what the decision was, why it was difficult, how you made the decision, and explain what the outcome was.',
      'Describe an important historical event in your country. You should say: what the event was, when it happened, how it affected people, and explain why it is significant.',
      'Describe a controversial topic you feel strongly about. You should say: what the topic is, why it is controversial, what your opinion is, and explain why you hold this view.',
    ],
    3: [
      'We\'ve been talking about decisions. To what extent do you think cultural background influences decision-making? How can critical thinking skills be developed in education?',
      'We\'ve been talking about history. How important is it for young people to learn about history? Do you think historical monuments should always be preserved?',
      'We\'ve been talking about controversy. How has the internet changed the way people form opinions? Should social media platforms regulate controversial content?',
    ],
  },
}

export default function NewSpeakingTestPage() {
  const { user } = useAuth()
  const [part, setPart] = useState<1 | 2 | 3>(1)
  const [topic, setTopic] = useState('')
  const [transcript, setTranscript] = useState('')
  const [recording, setRecording] = useState(false)
  const [micStatus, setMicStatus] = useState<'idle' | 'listening' | 'error'>('idle')
  const [interimText, setInterimText] = useState('')
  const [timeSpent, setTimeSpent] = useState(0)
  const [started, setStarted] = useState(false)
  const [testId, setTestId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)
  const recordingRef = useRef(false)
  const transcriptRef = useRef('')
  const router = useRouter()

  const difficulty = user?.difficulty_level || 'intermediate'

  useEffect(() => {
    if (user?.role === 'admin') { router.push('/admin/speaking'); return }
  }, [user, router])

  useEffect(() => {
    const topics = SPEAKING_TOPICS[difficulty]?.[part] || SPEAKING_TOPICS['intermediate'][part]
    setTopic(topics[Math.floor(Math.random() * topics.length)])
  }, [part, difficulty])

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

  // Keep transcriptRef in sync so speech callbacks always have latest value
  useEffect(() => { transcriptRef.current = transcript }, [transcript])

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      setMicStatus('error')
      return
    }

    // Request mic permission explicitly first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop()) // release immediately, we just needed permission
    } catch (err) {
      toast.error('Microphone access denied. Please allow microphone permission and try again.')
      setMicStatus('error')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onaudiostart = () => {
      setMicStatus('listening')
    }

    recognition.onresult = (event: any) => {
      let interim = ''
      let currentFinal = transcriptRef.current
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          currentFinal += t + ' '
          setTranscript(currentFinal)
          transcriptRef.current = currentFinal
          setInterimText('')
        } else {
          interim += t
        }
      }
      if (interim) {
        setInterimText(interim)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone in browser settings.')
      } else if (event.error === 'no-speech') {
        // Don't stop — just keep listening
        return
      } else if (event.error !== 'aborted') {
        toast.error(`Speech recognition error: ${event.error}`)
      }
      recordingRef.current = false
      setRecording(false)
      setMicStatus('error')
    }

    recognition.onend = () => {
      if (recordingRef.current) {
        // Auto-restart to keep listening continuously
        try { recognition.start() } catch {}
      } else {
        setMicStatus('idle')
      }
    }

    recognitionRef.current = recognition
    recordingRef.current = true
    setRecording(true)

    try {
      recognition.start()
      toast.success('Listening... Speak clearly into your microphone.')
    } catch (err: any) {
      toast.error('Failed to start speech recognition: ' + err.message)
      recordingRef.current = false
      setRecording(false)
      setMicStatus('error')
    }
  }

  const stopRecording = () => {
    recordingRef.current = false
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setRecording(false)
    setInterimText('')
    setMicStatus('idle')
    toast.success('Recording stopped.')
  }

  const toggleRecording = () => {
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const submitTest = async () => {
    if (!testId || !transcript.trim()) {
      toast.error('Please enter your speaking transcript before submitting.')
      return
    }
    setSubmitting(true)
    if (recording) stopRecording()
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      }
    }
  }, [])

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">IELTS Speaking Test</h1>
          <p className="text-gray-500 mt-1">Practice your speaking skills &bull; <span className="capitalize">{difficulty}</span> level</p>
        </div>

        {!started ? (
          <Card className="rounded-2xl border-gray-100 shadow-soft">
            <CardBody className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Part</label>
                <div className="grid grid-cols-3 gap-3">
                  {([1, 2, 3] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPart(p)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${part === p ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-100' : 'border-gray-200 hover:border-gray-300'}`}
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
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <p className="text-gray-800 leading-relaxed">{topic}</p>
                </div>
              </div>

              <Button size="lg" onClick={startTest} className="w-full rounded-xl" variant="secondary">
                <Mic className="h-5 w-5 mr-2" /> Start Speaking Test
              </Button>
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Timer Bar */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-3 flex items-center justify-between sticky top-16 z-10">
              <span className="text-sm font-medium text-gray-700">Part {part}</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-sm font-medium">{formatTime(timeSpent)}</span>
                </div>
                <Button onClick={submitTest} loading={submitting} size="sm" variant="secondary" className="rounded-xl">
                  <Send className="h-4 w-4 mr-1" /> Submit
                </Button>
              </div>
            </div>

            {/* Topic Card */}
            <Card className="rounded-2xl border-emerald-200 bg-emerald-50">
              <CardBody>
                <p className="text-sm font-medium text-emerald-700 mb-2">SPEAKING PART {part}</p>
                <p className="text-gray-800 leading-relaxed">{topic}</p>
              </CardBody>
            </Card>

            {/* Recording Controls */}
            <Card className="rounded-2xl border-gray-100 shadow-soft">
              <CardBody className="text-center space-y-5 py-8">
                <p className="text-sm text-gray-500">
                  Click the microphone to speak — your voice will be transcribed automatically. You can also type or edit below.
                </p>
                <button
                  onClick={toggleRecording}
                  className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center transition-all ${
                    recording
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 animate-pulse'
                      : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200'
                  }`}
                >
                  {recording ? <Square className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
                </button>
                <div>
                  {recording ? (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm text-red-600 font-medium">
                        {micStatus === 'listening' ? 'Listening — speak now...' : 'Starting microphone...'}
                      </span>
                    </div>
                  ) : micStatus === 'error' ? (
                    <span className="text-sm text-red-500">Mic error — check permissions or use Chrome</span>
                  ) : (
                    <span className="text-xs text-gray-400">Click to start speaking</span>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Transcript */}
            <Card className="rounded-2xl border-gray-100 shadow-soft">
              <CardBody>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transcript <span className="text-gray-400 font-normal">(auto-transcribed — you can edit)</span>
                </label>
                <div className="relative">
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Start speaking and your words will appear here... You can also type or edit."
                    className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-900 leading-relaxed transition-all"
                  />
                  {interimText && (
                    <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                      <span className="text-sm text-emerald-500 italic animate-pulse">{interimText}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">Words: {transcript.trim() ? transcript.trim().split(/\s+/).length : 0}</p>
                  {recording && (
                    <p className="text-xs text-red-500 font-medium flex items-center">
                      <span className="h-2 w-2 bg-red-500 rounded-full mr-1.5 animate-pulse" />
                      Live transcribing...
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
