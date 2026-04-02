'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getUser } from '@/lib/auth'
import { Button, Input } from '@/components/ui'
import { BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ email, password })
      toast.success('Login successful!')
      const userData = getUser()
      if (userData?.role === 'student' && !userData?.has_completed_placement) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Decorative element */}
      <div className="absolute top-8 right-8 w-20 h-20 bg-primary-200/30 rounded-full blur-2xl pointer-events-none hidden lg:block" />

      <div className="bg-white rounded-2xl shadow-soft-lg p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-5 shadow-soft">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your IELTS Mentor account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="pt-2">
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary-600 font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
