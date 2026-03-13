'use client'

import Link from 'next/link'
import { BookOpen, PenTool, Mic, BarChart3, Brain, Monitor, ArrowRight, CheckCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

const features = [
  { icon: PenTool, title: 'Writing Practice', desc: 'Practice Task 1 & Task 2 with AI-powered evaluation and detailed band scoring.' },
  { icon: Mic, title: 'Speaking Practice', desc: 'Interactive speaking tests with real-time transcription and pronunciation feedback.' },
  { icon: BookOpen, title: 'Reading Practice', desc: 'Full-length reading passages with various question types and instant scoring.' },
  { icon: Brain, title: 'AI Feedback', desc: 'Get detailed feedback powered by Google Gemini AI on every test attempt.' },
  { icon: BarChart3, title: 'Progress Tracking', desc: 'Track your improvement over time with detailed analytics and charts.' },
  { icon: Monitor, title: 'Exam Simulation', desc: 'Experience a computer-delivered test environment that mirrors the real IELTS exam.' },
]

const stats = [
  { value: '9.0', label: 'Band Score Scale' },
  { value: '4', label: 'Test Modules' },
  { value: 'AI', label: 'Powered Feedback' },
  { value: '24/7', label: 'Practice Access' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="gradient-bg pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-sm mb-6">
            <Brain className="h-4 w-4 mr-2" /> AI-Powered IELTS Preparation
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Prepare for IELTS with<br />
            <span className="text-accent-300">Intelligent Practice</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Get personalized feedback, track your progress, and improve your band score with our AI-powered IELTS preparation platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="inline-flex items-center px-8 py-3.5 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/login" className="inline-flex items-center px-8 py-3.5 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary-700">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our comprehensive platform covers all aspects of IELTS preparation with cutting-edge AI technology.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-300">
                  <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Ace Your IELTS?</h2>
          <p className="text-lg text-gray-600 mb-8">Join thousands of students who improved their band scores with IELTS Mentor.</p>
          <div className="space-y-3 text-left max-w-md mx-auto mb-8">
            {['Instant AI-powered feedback on writing & speaking', 'Realistic test simulation environment', 'Detailed progress analytics and insights', 'Practice anytime, anywhere'].map((item) => (
              <div key={item} className="flex items-center">
                <CheckCircle className="h-5 w-5 text-secondary-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <Link href="/register" className="inline-flex items-center px-8 py-3.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-lg">
            Start Practicing Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-primary-400 mr-2" />
            <span className="text-lg font-bold text-white">IELTS Mentor</span>
          </div>
          <p className="text-sm mb-4">AI-Powered IELTS Preparation Platform</p>
          <p className="text-xs">University of Education, Lahore &copy; 2025. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
