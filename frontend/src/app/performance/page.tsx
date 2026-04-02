'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { api } from '@/lib/api'
import { Card, CardBody, Spinner } from '@/components/ui'
import { TrendingUp, PenTool, Mic, BookOpen, Target } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import type { DashboardStats, StudentProgress } from '@/types'

function formatBand(val: number) {
  return val ? val.toFixed(1) : '0.0'
}

export default function PerformancePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, p] = await Promise.all([
          api.getDashboard(),
          api.getProgress(days),
        ])
        setStats(s)
        setProgress(p)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [days])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      </DashboardLayout>
    )
  }

  // Prepare line chart data - merge all progress by date
  const progressMap = new Map<string, { date: string; writing: number | null; speaking: number | null; reading: number | null }>()

  progress?.writing_progress.forEach(w => {
    const d = w.date.slice(0, 10)
    const entry = progressMap.get(d) || { date: d, writing: null, speaking: null, reading: null }
    entry.writing = w.band
    progressMap.set(d, entry)
  })
  progress?.speaking_progress.forEach(s => {
    const d = s.date.slice(0, 10)
    const entry = progressMap.get(d) || { date: d, writing: null, speaking: null, reading: null }
    entry.speaking = s.band
    progressMap.set(d, entry)
  })
  progress?.reading_progress.forEach(r => {
    const d = r.date.slice(0, 10)
    const entry = progressMap.get(d) || { date: d, writing: null, speaking: null, reading: null }
    entry.reading = r.score
    progressMap.set(d, entry)
  })

  const lineData = Array.from(progressMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  // Bar chart data for test counts
  const barData = [
    { name: 'Writing', count: stats?.writing_count || 0, fill: '#3b82f6' },
    { name: 'Speaking', count: stats?.speaking_count || 0, fill: '#10b981' },
    { name: 'Reading', count: stats?.reading_count || 0, fill: '#8b5cf6' },
  ]

  // Radar chart data for skill breakdown
  const radarData = [
    { skill: 'Writing', score: stats?.writing_avg_band || 0 },
    { skill: 'Speaking', score: stats?.speaking_avg_band || 0 },
    { skill: 'Reading', score: stats?.reading_avg_score || 0 },
  ]

  const statCards = [
    { label: 'Overall Average', value: formatBand(stats?.overall_avg || 0), icon: Target, bg: 'bg-primary-50', color: 'text-primary-600' },
    { label: 'Writing Avg', value: formatBand(stats?.writing_avg_band || 0), icon: PenTool, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Speaking Avg', value: formatBand(stats?.speaking_avg_band || 0), icon: Mic, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Reading Avg', value: formatBand(stats?.reading_avg_score || 0), icon: BookOpen, bg: 'bg-violet-50', color: 'text-violet-600' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900">Performance</h1>
            <p className="text-gray-500 mt-1 text-sm">Track your IELTS progress and scores</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-xl">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  days === d
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, bg, color }) => (
            <Card key={label} className="rounded-2xl border-gray-100 shadow-soft">
              <CardBody className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold font-display text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Score Trend Chart */}
        <Card className="rounded-2xl border-gray-100 shadow-soft">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              <h2 className="font-semibold font-display text-gray-900">Score Trend</h2>
            </div>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={lineData}>
                  <defs>
                    <linearGradient id="colorWriting" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSpeaking" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReading" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 9]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="writing" stroke="#3b82f6" strokeWidth={2} fill="url(#colorWriting)" dot={{ r: 4, fill: '#3b82f6' }} connectNulls name="Writing" />
                  <Area type="monotone" dataKey="speaking" stroke="#10b981" strokeWidth={2} fill="url(#colorSpeaking)" dot={{ r: 4, fill: '#10b981' }} connectNulls name="Speaking" />
                  <Area type="monotone" dataKey="reading" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorReading)" dot={{ r: 4, fill: '#8b5cf6' }} connectNulls name="Reading" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16 text-gray-400 text-sm">
                No data yet. Complete some tests to see your score trend.
              </div>
            )}
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tests Completed Bar Chart */}
          <Card className="rounded-2xl border-gray-100 shadow-soft">
            <CardBody className="p-6">
              <h2 className="font-semibold font-display text-gray-900 mb-6">Tests Completed</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Skills Radar Chart */}
          <Card className="rounded-2xl border-gray-100 shadow-soft">
            <CardBody className="p-6">
              <h2 className="font-semibold font-display text-gray-900 mb-6">Skills Breakdown</h2>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <PolarRadiusAxis domain={[0, 9]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Total Tests Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'Total Tests',
              value: stats?.total_tests || 0,
              icon: Target,
              gradient: 'from-primary-500 to-indigo-600',
            },
            {
              label: 'Best Skill',
              value: (() => {
                const scores = { Writing: stats?.writing_avg_band || 0, Speaking: stats?.speaking_avg_band || 0, Reading: stats?.reading_avg_score || 0 }
                const best = Object.entries(scores).sort(([,a], [,b]) => b - a)[0]
                return best[1] > 0 ? best[0] : '-'
              })(),
              icon: TrendingUp,
              gradient: 'from-emerald-500 to-teal-600',
            },
            {
              label: 'Needs Work',
              value: (() => {
                const scores = { Writing: stats?.writing_avg_band || 0, Speaking: stats?.speaking_avg_band || 0, Reading: stats?.reading_avg_score || 0 }
                const active = Object.entries(scores).filter(([,v]) => v > 0)
                if (active.length === 0) return '-'
                const worst = active.sort(([,a], [,b]) => a - b)[0]
                return worst[0]
              })(),
              icon: Target,
              gradient: 'from-amber-500 to-orange-600',
            },
          ].map(({ label, value, icon: Icon, gradient }) => (
            <Card key={label} className="rounded-2xl border-gray-100 shadow-soft overflow-hidden relative group hover:shadow-md transition-all">
              <CardBody className="p-5 relative z-10">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold font-display text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
              </CardBody>
              <div className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.06] group-hover:opacity-[0.1] transition-opacity`} />
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
