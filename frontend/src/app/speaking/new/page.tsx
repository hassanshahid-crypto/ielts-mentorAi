'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Button, Card, CardBody, Spinner } from '@/components/ui'
import { formatTime } from '@/lib/utils'
import { Mic, Clock, Send, Square, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

type PartNumber = 1 | 2 | 3

export default function NewSpeakingTestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const difficulty = user?.difficulty_level || 'intermediate'

  // Test set fetched from admin
  const [testSet, setTestSet] = useState<{ set_id: string; theme: string; parts: Record<PartNumber, string> } | null>(null)
  const [loadingSet, setLoadingSet] = useState(true)

  // Wizard state
  const [started, setStarted] = useState(false)
  const [currentPart, setCurrentPart] = useState<PartNumber>(1)
  const [transcripts, setTranscripts] = useState<Record<PartNumber, string>>({ 1: '', 2: '', 3: '' })
  const [durations, setDurations] = useState<Record<PartNumber, number>>({ 1: 0, 2: 0, 3: 0 })
  const [submitting, setSubmitting] = useState(false)

  // Recording state for the active part
  const [activeTranscript, setActiveTranscript] = useState('')
  const [recording, setRecording] = useState(false)
  const [micStatus, setMicStatus] = useState<'idle' | 'listening' | 'error'>('idle')
  const [interimText, setInterimText] = useState('')
  const [partTime, setPartTime] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)
  const recordingRef = useRef(false)
  const transcriptRef = useRef('')

  useEffect(() => {
    if (user?.role === 'admin') { router.push('/admin/speaking'); return }
  }, [user, router])

  // Fetch a coherent 3-part test set for the student's level
  useEffect(() => {
    let cancelled = false
    setLoadingSet(true)
    api.getSpeakingTestSet(difficulty)
      .then((res) => {
        if (cancelled) return
        if (res && res.set_id && res.parts && res.parts.length === 3) {
          const partsMap: Record<PartNumber, string> = { 1: '', 2: '', 3: '' }
          res.parts.forEach((p: any) => { partsMap[p.part_number as PartNumber] = p.topic })
          setTestSet({ set_id: res.set_id, theme: res.theme || '', parts: partsMap })
        } else {
          setTestSet(null)
        }
      })
      .catch(() => setTestSet(null))
      .finally(() => { if (!cancelled) setLoadingSet(false) })
    return () => { cancelled = true }
  }, [difficulty])

  // Keep transcriptRef in sync so speech callbacks always have latest value
  useEffect(() => { transcriptRef.current = activeTranscript }, [activeTranscript])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startSession = () => {
    setStarted(true)
    setCurrentPart(1)
    setActiveTranscript('')
    setPartTime(0)
    timerRef.current = setInterval(() => setPartTime((t) => t + 1), 1000)
  }

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      setMicStatus('error')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
    } catch {
      toast.error('Microphone access denied. Please allow microphone permission and try again.')
      setMicStatus('error')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onaudiostart = () => setMicStatus('listening')

    recognition.onresult = (event: any) => {
      let interim = ''
      let currentFinal = transcriptRef.current
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          currentFinal += t + ' '
          setActiveTranscript(currentFinal)
          transcriptRef.current = currentFinal
          setInterimText('')
        } else {
          interim += t
        }
      }
      if (interim) setInterimText(interim)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone in browser settings.')
      } else if (event.error === 'no-speech') {
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
  }

  const toggleRecording = () => {
    if (recording) stopRecording()
    else startRecording()
  }

  const persistCurrentPart = () => {
    if (recording) stopRecording()
    setTranscripts((prev) => ({ ...prev, [currentPart]: activeTranscript.trim() }))
    setDurations((prev) => ({ ...prev, [currentPart]: partTime }))
  }

  const goToPart = (next: PartNumber) => {
    persistCurrentPart()
    setCurrentPart(next)
    setActiveTranscript(transcripts[next] || '')
    transcriptRef.current = transcripts[next] || ''
    setPartTime(durations[next] || 0)
  }

  const goNext = () => {
    if (!activeTranscript.trim()) {
      toast.error('Please record or type your response before moving on.')
      return
    }
    if (currentPart < 3) goToPart((currentPart + 1) as PartNumber)
  }

  const goPrev = () => {
    if (currentPart > 1) goToPart((currentPart - 1) as PartNumber)
  }

  const submitFullSession = async () => {
    persistCurrentPart()
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }

    // Build the final transcripts incorporating the just-persisted current part
    const finalTranscripts: Record<PartNumber, string> = {
      ...transcripts,
      [currentPart]: activeTranscript.trim(),
    }
    const finalDurations: Record<PartNumber, number> = {
      ...durations,
      [currentPart]: partTime,
    }
    if (!finalTranscripts[1] || !finalTranscripts[2] || !finalTranscripts[3]) {
      toast.error('All three parts must have a response before submitting.')
      // restart timer if not all parts done
      timerRef.current = setInterval(() => setPartTime((t) => t + 1), 1000)
      return
    }
    if (!testSet) return

    setSubmitting(true)
    try {
      const result = await api.submitSpeakingSession({
        set_id: testSet.set_id,
        part1_transcript: finalTranscripts[1],
        part2_transcript: finalTranscripts[2],
        part3_transcript: finalTranscripts[3],
        part1_duration: finalDurations[1],
        part2_duration: finalDurations[2],
        part3_duration: finalDurations[3],
      })
      toast.success('Session submitted! Showing your evaluation...')
      router.push(`/speaking/${result.canonical_test_id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit session.')
      setSubmitting(false)
      timerRef.current = setInterval(() => setPartTime((t) => t + 1), 1000)
    }
  }

  // ────────────────────────────────────────────────────────
  // Render

  if (loadingSet) {
    return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>
  }

  if (!testSet) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="rounded-2xl border-gray-100 shadow-soft">
            <CardBody className="text-center py-12">
              <Mic className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No speaking tests available</h2>
              <p className="text-gray-500 mb-1">No 3-part speaking test sets have been created for the <span className="capitalize font-medium">{difficulty}</span> level yet.</p>
              <p className="text-gray-500">Please ask an admin to create one in <span className="font-mono text-xs">Manage Speaking Tests → Create Full 3-Part Test</span>.</p>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const currentTopic = testSet.parts[currentPart]
  const partLabels: Record<PartNumber, string> = {
    1: 'Introduction (4-5 min)',
    2: 'Long Turn (3-4 min)',
    3: 'Discussion (4-5 min)',
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">IELTS Speaking Test</h1>
          <p className="text-gray-500 mt-1">
            <span className="capitalize">{difficulty}</span> level &bull; Theme: <span className="text-emerald-600 font-medium">{testSet.theme}</span>
          </p>
        </div>

        {!started ? (
          <Card className="rounded-2xl border-gray-100 shadow-soft">
            <CardBody className="space-y-6">
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Full 3-Part Speaking Session</h2>
                <p className="text-sm text-gray-500">You will record responses for all three parts. They will be evaluated together as one IELTS Speaking session.</p>
              </div>

              <div className="space-y-3">
                {([1, 2, 3] as const).map((p) => (
                  <div key={p} className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-gray-900">Part {p}</span>
                      <span className="text-xs text-gray-400">{partLabels[p]}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{testSet.parts[p]}</p>
                  </div>
                ))}
              </div>

              <Button size="lg" onClick={startSession} className="w-full rounded-xl" variant="secondary">
                <Mic className="h-5 w-5 mr-2" /> Start Speaking Test
              </Button>
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Progress / Timer Bar */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-3 flex items-center justify-between sticky top-16 z-10 gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {([1, 2, 3] as const).map((p) => {
                  const done = !!transcripts[p]?.trim() && p < currentPart
                  const active = p === currentPart
                  return (
                    <div key={p} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      active ? 'bg-emerald-100 text-emerald-700'
                      : done ? 'bg-gray-100 text-gray-500'
                      : 'bg-gray-50 text-gray-400'
                    }`}>
                      {done && <CheckCircle2 className="h-3 w-3" />}
                      Part {p}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-sm font-medium">{formatTime(partTime)}</span>
                </div>
              </div>
            </div>

            {/* Topic Card */}
            <Card className="rounded-2xl border-emerald-200 bg-emerald-50">
              <CardBody>
                <p className="text-xs font-bold text-emerald-700 mb-2 tracking-wider">SPEAKING PART {currentPart} &bull; {partLabels[currentPart]}</p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{currentTopic}</p>
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
                    value={activeTranscript}
                    onChange={(e) => setActiveTranscript(e.target.value)}
                    placeholder="Start speaking and your words will appear here... You can also type or edit."
                    className="w-full h-44 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-900 leading-relaxed transition-all"
                  />
                  {interimText && (
                    <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                      <span className="text-sm text-emerald-500 italic animate-pulse">{interimText}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">Words: {activeTranscript.trim() ? activeTranscript.trim().split(/\s+/).length : 0}</p>
                  {recording && (
                    <p className="text-xs text-red-500 font-medium flex items-center">
                      <span className="h-2 w-2 bg-red-500 rounded-full mr-1.5 animate-pulse" />
                      Live transcribing...
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Wizard Navigation */}
            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" onClick={goPrev} disabled={currentPart === 1} className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              {currentPart < 3 ? (
                <Button onClick={goNext} variant="secondary" className="rounded-xl">
                  Next: Part {currentPart + 1} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={submitFullSession} loading={submitting} variant="secondary" className="rounded-xl">
                  <Send className="h-4 w-4 mr-1" /> Submit Full Test
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
