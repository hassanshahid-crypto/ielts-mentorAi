'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, PenTool, Mic, Brain, BarChart3, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'

const slides = [
  {
    icon: Sparkles,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    title: 'Welcome to IELTS Mentor',
    subtitle: 'Your AI-powered IELTS preparation companion',
    description: 'Get personalized practice tests, instant AI feedback, and track your progress towards your target band score.',
    image: (
      <div className="flex items-center justify-center space-x-3 mt-6">
        <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center"><PenTool className="h-8 w-8 text-blue-600" /></div>
        <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center"><Mic className="h-8 w-8 text-green-600" /></div>
        <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center"><BookOpen className="h-8 w-8 text-purple-600" /></div>
      </div>
    ),
  },
  {
    icon: PenTool,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Writing & Speaking Practice',
    subtitle: 'Practice all IELTS test modules',
    description: 'Take Writing Task 1 & 2 tests, practice Speaking Parts 1-3 with real-time speech-to-text transcription, and get detailed AI-powered feedback on every submission.',
    image: (
      <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white text-left max-w-xs mx-auto">
        <p className="text-blue-200 text-xs font-medium mb-1">OVERALL BAND SCORE</p>
        <p className="text-4xl font-bold">7.5</p>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs"><span className="text-blue-200">Task Achievement</span><span className="font-medium">7.0</span></div>
          <div className="h-1.5 bg-blue-400 rounded-full"><div className="h-full bg-white rounded-full" style={{ width: '78%' }} /></div>
        </div>
      </div>
    ),
  },
  {
    icon: BookOpen,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'Reading Practice',
    subtitle: 'Various question types & instant scoring',
    description: 'Practice with realistic IELTS reading passages featuring MCQ, True/False/Not Given, fill-in-the-blank, and more — all scored instantly.',
    image: (
      <div className="mt-6 bg-gray-50 border rounded-2xl p-5 text-left max-w-xs mx-auto">
        <div className="flex items-center space-x-2 mb-3">
          <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center"><span className="text-green-600 text-xs font-bold">1</span></div>
          <p className="text-sm text-gray-700 font-medium">What is the main idea?</p>
        </div>
        <div className="space-y-1.5 ml-8">
          <div className="px-3 py-1.5 rounded-lg bg-green-100 border border-green-300 text-xs text-green-800">Environmental awareness</div>
          <div className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-500">Economic growth</div>
        </div>
      </div>
    ),
  },
  {
    icon: Brain,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'AI Feedback & Analytics',
    subtitle: 'Powered by Google Gemini AI',
    description: 'Receive detailed, personalized feedback on every test with specific improvement suggestions. Track your band score progress over time with comprehensive analytics.',
    image: (
      <div className="mt-6 flex items-end justify-center space-x-2 h-24">
        {[4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5].map((v, i) => (
          <motion.div
            key={v}
            initial={{ height: 0 }}
            animate={{ height: `${(v / 9) * 100}%` }}
            transition={{ delay: 0.1 * i, duration: 0.5, ease: 'easeOut' }}
            className="w-6 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-md"
          />
        ))}
      </div>
    ),
  },
]

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const finish = () => {
    if (user?.role === 'student' && !user?.has_completed_placement) {
      router.push('/placement')
    } else {
      router.push('/dashboard')
    }
  }

  const next = () => {
    if (step < slides.length - 1) {
      setStep(step + 1)
    } else {
      finish()
    }
  }

  const slide = slides[step]
  const Icon = slide.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Progress dots */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`transition-all duration-300 rounded-full ${
                i === step ? 'w-8 h-2 bg-primary-600' : 'w-2 h-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-white rounded-3xl shadow-xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className={`inline-flex items-center justify-center h-16 w-16 ${slide.iconBg} rounded-2xl mb-6`}
            >
              <Icon className={`h-8 w-8 ${slide.iconColor}`} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              {slide.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-primary-600 font-medium text-sm mb-3"
            >
              {slide.subtitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 text-sm leading-relaxed"
            >
              {slide.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {slide.image}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : null}
            className={`flex items-center text-sm font-medium transition-colors ${
              step > 0 ? 'text-gray-600 hover:text-gray-900' : 'text-transparent pointer-events-none'
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </button>

          <button
            onClick={finish}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            Skip
          </button>

          <button
            onClick={next}
            className="flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 transition-colors"
          >
            {step === slides.length - 1 ? 'Get Started' : 'Next'} <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}
