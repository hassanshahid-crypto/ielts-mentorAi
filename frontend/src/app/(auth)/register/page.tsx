'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button, Input } from '@/components/ui'
import { BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', password_confirm: '',
    first_name: '', last_name: '',
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.password_confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success('Registration successful! Please login.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string, value: string) => setForm({ ...form, [field]: value })

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Decorative element */}
      <div className="absolute top-8 right-8 w-20 h-20 bg-primary-200/30 rounded-full blur-2xl pointer-events-none hidden lg:block" />

      <div className="bg-white rounded-2xl shadow-soft-lg p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-5 shadow-soft">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2 text-sm">Join IELTS Mentor and start practicing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} placeholder="John" />
            <Input label="Last Name" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} placeholder="Doe" />
          </div>
          <Input label="Username" value={form.username} onChange={(e) => update('username', e.target.value)} placeholder="johndoe" required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="your@email.com" required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 6 characters" required />
          <Input label="Confirm Password" type="password" value={form.password_confirm} onChange={(e) => update('password_confirm', e.target.value)} placeholder="Repeat password" required />
          <div className="pt-2">
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
