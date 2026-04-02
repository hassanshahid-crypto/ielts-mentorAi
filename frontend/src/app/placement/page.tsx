'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card, CardBody, Spinner } from '@/components/ui'
import { BookOpen, PenTool, Mic, ArrowRight, ArrowLeft, CheckCircle, Trophy, Square, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import type { PlacementQuestions, PlacementResult } from '@/types'

type Step = 'welcome' | 'reading' | 'writing' | 'speaking' | 'submitting' | 'results'

export default function PlacementPage() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [questions, setQuestions] = useState<PlacementQuestions | null>(null)
  const [loading, setLoading] = useState(true)
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({})
  const [writingText, setWritingText] = useState('')
  const [speakingText, setSpeakingText] = useState('')
  const [result, setResult] = useState<PlacementResult | null>(null)
  const [recording, setRecording] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef<any>(null)
  const recordingRef = useRef(false)
  const [evalStep, setEvalStep] = useState(0)

  useEffect(() => {
    if (user?.has_completed_placement) {
      router.push('/dashboard')
      return
    }
    api.getPlacementQuestions()
      .then(setQuestions)
      .catch(() => toast.error('Failed to load placement test'))
      .finally(() => setLoading(false))
  }, [user, router])

  // Evaluation animation steps
  useEffect(() => {
    if (step === 'submitting') {
      const steps = [0, 1, 2, 3]
      let i = 0
      const interval = setInterval(() => {
        i++
        if (i < steps.length) setEvalStep(i)
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [step])

  const speakingRef = useRef('')
  useEffect(() => { speakingRef.current = speakingText }, [speakingText])

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported. Please use Chrome or Edge.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
    } catch {
      toast.error('Microphone access denied. Please allow microphone permission.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (event: any) => {
      let interim = ''
      let currentFinal = speakingRef.current
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          currentFinal += t + ' '
          setSpeakingText(currentFinal)
          speakingRef.current = currentFinal
          setInterimText('')
        } else {
          interim += t
        }
      }
      if (interim) setInterimText(interim)
    }
    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return
      if (event.error !== 'aborted') toast.error(`Speech error: ${event.error}`)
      recordingRef.current = false
      setRecording(false)
    }
    recognition.onend = () => { if (recordingRef.current) try { recognition.start() } catch {} }
    recognitionRef.current = recognition
    recordingRef.current = true
    setRecording(true)
    try {
      recognition.start()
      toast.success('Listening... Speak clearly.')
    } catch (err: any) {
      toast.error('Failed to start speech recognition.')
      recordingRef.current = false
      setRecording(false)
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
  }

  useEffect(() => {
    return () => { if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop() } }
  }, [])

  const handleSubmit = async () => {
    setStep('submitting')
    setEvalStep(0)
    try {
      const res = await api.submitPlacement({
        reading_answers: readingAnswers,
        writing_text: writingText,
        speaking_transcript: speakingText,
      })
      setResult(res)
      await refreshUser()
      setStep('results')
    } catch (err: any) {
      toast.error(err.message || 'Submission failed')
      setStep('speaking')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const levelConfig = {
    beginner: { label: 'Beginner', variant: 'success' as const },
    intermediate: { label: 'Intermediate', variant: 'warning' as const },
    pro: { label: 'Pro', variant: 'danger' as const },
  }

  const evalMessages = [
    { icon: BookOpen, text: 'Checking your reading answers...', color: 'text-purple-600' },
    { icon: PenTool, text: 'AI is evaluating your writing...', color: 'text-blue-600' },
    { icon: Mic, text: 'AI is evaluating your speaking...', color: 'text-green-600' },
    { icon: Brain, text: 'Calculating your difficulty level...', color: 'text-primary-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Progress bar */}
        {!['welcome', 'results', 'submitting'].includes(step) && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Placement Test</span>
              <span>{step === 'reading' ? '1/3' : step === 'writing' ? '2/3' : '3/3'}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-600 rounded-full"
                animate={{ width: step === 'reading' ? '33%' : step === 'writing' ? '66%' : '100%' }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Welcome */}
          {step === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card>
                <CardBody className="text-center py-12 space-y-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center h-16 w-16 bg-primary-100 rounded-2xl mx-auto">
                    <Trophy className="h-8 w-8 text-primary-600" />
                  </motion.div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Let&apos;s Find Your Level{user?.first_name ? `, ${user.first_name}` : ''}!
                    </h1>
                    <p className="text-gray-500 mt-3 max-w-md mx-auto">
                      A quick placement test with reading, writing, and speaking exercises to set your difficulty level.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                    {[
                      { icon: BookOpen, label: 'Reading', bg: 'bg-purple-50', color: 'text-purple-600' },
                      { icon: PenTool, label: 'Writing', bg: 'bg-blue-50', color: 'text-blue-600' },
                      { icon: Mic, label: 'Speaking', bg: 'bg-green-50', color: 'text-green-600' },
                    ].map((item) => (
                      <div key={item.label} className={`text-center p-3 ${item.bg} rounded-xl`}>
                        <item.icon className={`h-6 w-6 ${item.color} mx-auto mb-1`} />
                        <p className="text-xs text-gray-600">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <Button size="lg" onClick={() => setStep('reading')}>
                    Start Placement Test <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Reading */}
          {step === 'reading' && questions && (
            <motion.div key="reading" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
              <Card>
                <CardBody>
                  <div className="flex items-center space-x-2 mb-4">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-bold text-gray-900">Reading Comprehension</h2>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700 leading-relaxed">{questions.reading.passage}</p>
                  </div>
                  <div className="space-y-5">
                    {questions.reading.questions.map((q, i) => (
                      <div key={q.id}>
                        <p className="text-sm font-medium text-gray-900 mb-2">{i + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt) => (
                            <label key={opt} className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors ${readingAnswers[q.id] === opt ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                              <input type="radio" name={q.id} checked={readingAnswers[q.id] === opt} onChange={() => setReadingAnswers({ ...readingAnswers, [q.id]: opt })} className="text-primary-600" />
                              <span className="text-sm text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep('welcome')}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                <Button onClick={() => setStep('writing')}>Next: Writing <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </motion.div>
          )}

          {/* Writing */}
          {step === 'writing' && questions && (
            <motion.div key="writing" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
              <Card>
                <CardBody>
                  <div className="flex items-center space-x-2 mb-4">
                    <PenTool className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-900">Writing Task</h2>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700">{questions.writing_prompt}</p>
                  </div>
                  <textarea className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none" placeholder="Write your response here..." value={writingText} onChange={(e) => setWritingText(e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">{writingText.split(/\s+/).filter(Boolean).length} words</p>
                </CardBody>
              </Card>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep('reading')}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                <Button onClick={() => setStep('speaking')}>Next: Speaking <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </motion.div>
          )}

          {/* Speaking */}
          {step === 'speaking' && questions && (
            <motion.div key="speaking" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
              <Card>
                <CardBody>
                  <div className="flex items-center space-x-2 mb-4">
                    <Mic className="h-5 w-5 text-green-600" />
                    <h2 className="text-lg font-bold text-gray-900">Speaking Task</h2>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700">{questions.speaking_prompt}</p>
                  </div>

                  {/* Mic button */}
                  <div className="text-center mb-4">
                    <button
                      onClick={recording ? stopRecording : startRecording}
                      className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center transition-all ${recording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                      {recording ? <Square className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                      {recording ? <span className="text-red-500 font-medium">Listening... Click to stop</span> : 'Click to speak, or type below'}
                    </p>
                  </div>

                  <div className="relative">
                    <textarea className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none" placeholder="Your speech will appear here... You can also type or edit." value={speakingText} onChange={(e) => setSpeakingText(e.target.value)} />
                    {interimText && (
                      <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                        <span className="text-sm text-green-500 italic animate-pulse">{interimText}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">{speakingText.split(/\s+/).filter(Boolean).length} words</p>
                    {recording && (
                      <p className="text-xs text-red-500 font-medium flex items-center">
                        <span className="h-2 w-2 bg-red-500 rounded-full mr-1.5 animate-pulse" />
                        Live transcribing...
                      </p>
                    )}
                  </div>
                </CardBody>
              </Card>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => { stopRecording(); setStep('writing') }}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                <Button onClick={() => { stopRecording(); handleSubmit() }}>Submit Placement Test <CheckCircle className="h-4 w-4 ml-1" /></Button>
              </div>
            </motion.div>
          )}

          {/* Submitting - Animated evaluation */}
          {step === 'submitting' && (
            <motion.div key="submitting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card>
                <CardBody className="py-16 space-y-8">
                  <div className="text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="inline-block">
                      <Brain className="h-12 w-12 text-primary-600" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-gray-900 mt-4">Evaluating Your Responses</h2>
                  </div>
                  <div className="max-w-sm mx-auto space-y-4">
                    {evalMessages.map((msg, i) => {
                      const Icon = msg.icon
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0.3 }}
                          animate={{ opacity: evalStep >= i ? 1 : 0.3 }}
                          className="flex items-center space-x-3"
                        >
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${evalStep >= i ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {evalStep > i ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : evalStep === i ? (
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                <Icon className={`h-4 w-4 ${msg.color}`} />
                              </motion.div>
                            ) : (
                              <Icon className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <span className={`text-sm ${evalStep >= i ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{msg.text}</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Results */}
          {step === 'results' && result && (
            <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white overflow-hidden">
                <CardBody className="text-center py-10 space-y-4 relative">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                    <Trophy className="h-12 w-12 mx-auto text-yellow-300" />
                  </motion.div>
                  <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-2xl font-bold">
                    Your Level: {levelConfig[result.difficulty_level].label}
                  </motion.h1>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-primary-100">
                    Average Score: {result.avg_score}/9.0
                  </motion.p>
                </CardBody>
              </Card>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: BookOpen, label: 'Reading', score: result.reading_score, color: 'text-purple-600' },
                  { icon: PenTool, label: 'Writing', score: result.writing_score, color: 'text-blue-600' },
                  { icon: Mic, label: 'Speaking', score: result.speaking_score, color: 'text-green-600' },
                ].map((item, i) => (
                  <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                    <Card>
                      <CardBody className="text-center py-4">
                        <item.icon className={`h-5 w-5 ${item.color} mx-auto mb-2`} />
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-xl font-bold text-gray-900">{item.score}</p>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Card>
                  <CardBody className="text-center py-6 space-y-3">
                    <p className="text-gray-600">
                      We&apos;ll show you <strong>{levelConfig[result.difficulty_level].label}</strong> level content. You can change this anytime in profile settings.
                    </p>
                    <Button size="lg" onClick={() => router.push('/dashboard')}>
                      Go to Dashboard <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardBody>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
