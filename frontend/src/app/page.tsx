'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, PenTool, Mic, BarChart3, Brain, Monitor, ArrowRight, CheckCircle, Sparkles, Star } from 'lucide-react'

const features = [
  { icon: PenTool, title: 'Writing Practice', desc: 'Practice Task 1 & Task 2 with AI evaluation and detailed band scoring.', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
  { icon: Mic, title: 'Speaking Practice', desc: 'Real-time speech-to-text transcription with pronunciation feedback.', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
  { icon: BookOpen, title: 'Reading Practice', desc: 'Full-length passages with MCQ, True/False, and instant scoring.', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
  { icon: Brain, title: 'AI Feedback', desc: 'Detailed feedback powered by Google Gemini AI on every attempt.', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
  { icon: BarChart3, title: 'Progress Tracking', desc: 'Track improvement over time with analytics and level progression.', color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50' },
  { icon: Monitor, title: 'Smart Difficulty', desc: 'Auto-adjusting difficulty that grows with you from Beginner to Pro.', color: 'from-cyan-500 to-teal-500', bg: 'bg-cyan-50' },
]

const stats = [
  { value: '9.0', label: 'Band Score Scale' },
  { value: '3', label: 'Difficulty Levels' },
  { value: 'AI', label: 'Powered Feedback' },
  { value: '24/7', label: 'Practice Access' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } }),
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-gray-900">IELTS Mentor</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link href="/login" className="text-gray-600 hover:text-primary-600 px-4 py-2 text-sm font-medium transition-colors">
              Login
            </Link>
            <Link href="/register" className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all hover:shadow-soft-lg hover:shadow-primary-600/25">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        {/* Decorative orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-400/15 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-accent-400/10 rounded-full blur-2xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full ring-1 ring-inset ring-white/20 bg-white/10 backdrop-blur-sm text-white/90 text-sm mb-8">
              <Sparkles className="h-4 w-4 mr-2 text-accent-300" /> AI-Powered IELTS Preparation
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold font-display text-white mb-6 leading-[1.1] tracking-tight"
          >
            Prepare for IELTS with
            <br />
            <span className="bg-gradient-to-r from-accent-300 to-secondary-300 bg-clip-text text-transparent">
              Intelligent Practice
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Get personalized feedback, track your progress, and improve your band score with our AI-powered platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="group inline-flex items-center px-8 py-3.5 bg-white text-primary-700 rounded-xl font-semibold hover:shadow-soft-lg hover:shadow-white/20 transition-all duration-300 text-lg">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="inline-flex items-center px-8 py-3.5 bg-white/10 backdrop-blur-sm ring-1 ring-inset ring-white/25 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 text-lg">
              Login
            </Link>
          </motion.div>

          {/* Floating glass cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {[
              { icon: PenTool, label: 'Writing', score: '7.5' },
              { icon: Mic, label: 'Speaking', score: '8.0' },
              { icon: BookOpen, label: 'Reading', score: '7.0' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-md ring-1 ring-inset ring-white/20 rounded-2xl p-4 text-center"
              >
                <item.icon className="h-5 w-5 text-white/70 mx-auto mb-1" />
                <p className="text-white/60 text-xs">{item.label}</p>
                <p className="text-white text-xl font-bold font-display">{item.score}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50/80">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="text-center"
            >
              <p className="text-4xl font-bold font-display bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Comprehensive IELTS preparation with cutting-edge AI technology.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 shadow-soft hover:shadow-soft-lg transition-all duration-500 hover:-translate-y-1"
                >
                  <div className={`h-12 w-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold font-display text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-400/10 rounded-full blur-3xl" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="relative max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4">Ready to Ace Your IELTS?</h2>
          <p className="text-lg text-white/70 mb-10">Join students who improved their band scores with IELTS Mentor.</p>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-10">
            {['AI-powered feedback', 'Real test simulation', 'Progress analytics', 'Practice anytime'].map((item) => (
              <div key={item} className="flex items-center text-left bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 ring-1 ring-inset ring-white/10">
                <CheckCircle className="h-4 w-4 text-secondary-400 mr-2 flex-shrink-0" />
                <span className="text-white/90 text-sm">{item}</span>
              </div>
            ))}
          </div>

          <Link href="/register" className="group inline-flex items-center px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold text-lg hover:shadow-soft-lg hover:shadow-white/20 transition-all duration-300">
            Start Practicing Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-8 w-8 bg-primary-500 rounded-xl flex items-center justify-center mr-2">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold font-display text-white">IELTS Mentor</span>
          </div>
          <p className="text-sm mb-4">AI-Powered IELTS Preparation Platform</p>
          <p className="text-xs text-gray-500">University of Education, Lahore &copy; 2025-2026. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
