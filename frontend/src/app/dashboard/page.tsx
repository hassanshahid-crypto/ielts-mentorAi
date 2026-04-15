'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Badge, Spinner } from '@/components/ui'
import { formatDate, formatBandScore } from '@/lib/utils'
import {
  PenTool, Mic, BookOpen, TrendingUp, Target, Award,
  ArrowRight, CheckCircle, Circle, Trophy, Star,
  ChevronRight
} from 'lucide-react'
import type { DashboardStats } from '@/types'

const levelLabels: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', pro: 'Pro' }

export default function DashboardPage() {
  const { user, refreshUser } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getDashboard().catch(() => null),
      user?.role === 'student' ? api.checkProgression().catch(() => null) : Promise.resolve(null),
    ]).then(([s, p]) => {
      setStats(s)
      setProgress(p)
      if (p?.promoted) refreshUser()
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const isStudent = user?.role === 'student'
  const userName = user?.first_name || user?.username || 'Student'
  const currentLevel = user?.difficulty_level || 'beginner'

  return (
    <div className="space-y-7">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold font-display text-gray-900 tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Here&apos;s your IELTS preparation overview</p>
        </div>
        {isStudent && user?.difficulty_level && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Current Level</span>
            <span className="text-sm font-bold text-primary-600">{levelLabels[currentLevel]}</span>
          </div>
        )}
      </div>

      {/* Main Content Grid: Progress + Quick Actions */}
      {isStudent && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
          {/* Level Progression Card */}
          <div>
            {progress && !progress.is_max_level ? (
              <div className="rounded-3xl bg-gradient-to-br from-[#5b4cdb] via-[#6c5ce7] to-[#8b7cf7] p-4 sm:p-6 text-white relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-36 translate-x-36" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-28 -translate-x-28" />

                <div className="relative z-10">
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-2 mb-5 flex-wrap">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="h-9 w-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">Overall Progress</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 flex-shrink-0">
                      <span className="text-2xl sm:text-3xl font-bold">{progress.overall_avg}</span>
                      <span className="text-xs text-white/60 whitespace-nowrap">Target {progress.threshold}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-white/60" />
                        <span className="text-sm font-medium text-white/80">{levelLabels[progress.current_level]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white/80">{levelLabels[progress.next_level]}</span>
                        <Star className="h-4 w-4 text-amber-300" />
                      </div>
                    </div>
                    <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-300 transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(100, (progress.overall_avg / progress.threshold) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Per-type stat cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { key: 'writing', label: 'WRITING', icon: PenTool, data: progress.writing },
                      { key: 'speaking', label: 'SPEAKING', icon: Mic, data: progress.speaking },
                      { key: 'reading', label: 'READING', icon: BookOpen, data: progress.reading },
                    ].map(({ key, label, icon: Icon, data }, idx) => (
                      <div key={key} className={`rounded-2xl p-2.5 sm:p-4 bg-white/10 backdrop-blur-sm border border-white/10 min-w-0 ${idx === 2 ? 'col-span-2 sm:col-span-1' : ''}`}>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                            <Icon className="h-3.5 w-3.5 text-white/70 flex-shrink-0" />
                            <span className="text-[9px] sm:text-[10px] font-bold text-white/70 tracking-wider truncate">{label}</span>
                          </div>
                          {data.done ? (
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-300 flex-shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/25 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-white">{data.done ? data.avg : '—'}</p>
                        <p className="text-[10px] sm:text-[11px] text-white/50 mt-0.5">
                          {data.count} {data.count === 1 ? 'test' : 'tests'} taken
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Promotion message */}
                  {progress.ready_to_promote && (
                    <div className="mt-4 bg-emerald-400/20 border border-emerald-300/30 rounded-xl p-3 flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-amber-300 flex-shrink-0" />
                      <p className="text-sm text-white font-medium">
                        You&apos;re ready to advance to {levelLabels[progress.next_level]}! Complete your next test to level up.
                      </p>
                    </div>
                  )}

                  {!progress.all_types_done && (
                    <p className="text-[11px] text-white/40 mt-4 text-center">
                      Complete at least {progress.required_per_type} test in each category with avg band {progress.threshold}+ to advance
                    </p>
                  )}
                </div>
              </div>
            ) : progress?.is_max_level ? (
              <div className="rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
                <div className="relative z-10 flex items-center gap-5">
                  <div className="h-16 w-16 bg-white/15 rounded-2xl flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-amber-200" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display">Pro Level Achieved!</h3>
                    <p className="text-white/80 mt-1">You&apos;ve reached the highest difficulty level. Keep practicing to maintain your skills.</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3 justify-center mt-6">
            {[
              { href: '/writing/new', label: 'Start Writing', sub: 'Practice Task 1 & 2', icon: PenTool, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
              { href: '/speaking/new', label: 'Start Speaking', sub: 'Live AI Evaluator', icon: Mic, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
              { href: '/reading', label: 'Start Reading', sub: 'Academic & General', icon: BookOpen, iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
            ].map(({ href, label, sub, icon: Icon, iconBg, iconColor }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-4 px-4 py-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-soft transition-all duration-200 cursor-pointer group">
                  <div className={`h-11 w-11 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Tests',
            value: stats?.total_tests || 0,
            icon: Target,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-500',
            trend: stats?.total_tests ? `+${Math.min(stats.total_tests, 12)}%` : null,
            trendColor: 'text-emerald-600',
          },
          {
            label: 'Overall Avg',
            value: formatBandScore(stats?.overall_avg || 0),
            icon: Award,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-500',
            trend: stats?.overall_avg ? '+0.5' : null,
            trendColor: 'text-emerald-600',
          },
          {
            label: 'Writing Band',
            value: formatBandScore(stats?.writing_avg_band || 0),
            icon: PenTool,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
            trend: 'Stable',
            trendColor: 'text-gray-500',
          },
          {
            label: 'Speaking Band',
            value: formatBandScore(stats?.speaking_avg_band || 0),
            icon: Mic,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
            trend: stats?.speaking_avg_band ? '+1.0' : null,
            trendColor: 'text-emerald-600',
          },
        ].map(({ label, value, icon: Icon, iconBg, iconColor, trend, trendColor }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-soft transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className={`h-10 w-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              {trend && (
                <span className={`text-xs font-semibold ${trendColor}`}>
                  {trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold font-display text-gray-900">Recent Activity</h2>
          <Link href="/results" className="text-xs text-gray-400 hover:text-primary-600 font-medium flex items-center gap-1 transition-colors">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Writing */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2.5">
              <PenTool className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Writing Lab</h3>
            </div>
            <div className="p-3">
              {stats?.recent_writing && stats.recent_writing.length > 0 ? (
                <div className="space-y-0.5">
                  {stats.recent_writing.map((test: any) => (
                    <Link
                      key={test.id}
                      href={`/writing/${test.id}`}
                      className="flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {test.task_type === 'task1' ? 'Task 1' : 'Task 2'}: {test.topic || 'Writing Test'}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(test.created_at)}</p>
                      </div>
                      <Badge
                        variant={test.status === 'evaluated' ? 'success' : test.status === 'submitted' ? 'info' : 'warning'}
                        className="text-[10px] ml-3 flex-shrink-0"
                      >
                        {test.status === 'evaluated' ? 'Graded' : test.status === 'submitted' ? 'Pending' : 'Draft'}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <PenTool className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No writing tests yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Speaking */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2.5">
              <Mic className="h-4 w-4 text-emerald-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Speaking Club</h3>
            </div>
            <div className="p-3">
              {stats?.recent_speaking && stats.recent_speaking.length > 0 ? (
                <div className="space-y-0.5">
                  {stats.recent_speaking.map((test: any) => (
                    <Link
                      key={test.id}
                      href={`/speaking/${test.id}`}
                      className="flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">Part {test.part_number}: {test.topic || 'Speaking Test'}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(test.created_at)}</p>
                      </div>
                      <Badge
                        variant={test.status === 'evaluated' ? 'success' : test.status === 'completed' ? 'info' : 'warning'}
                        className="text-[10px] ml-3 flex-shrink-0"
                      >
                        {test.status === 'evaluated' ? 'Graded' : test.status === 'completed' ? 'Completed' : 'Active'}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Mic className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No speaking tests yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Reading */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 text-violet-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Reading Hub</h3>
            </div>
            <div className="p-3">
              {stats?.recent_reading && stats.recent_reading.length > 0 ? (
                <div className="space-y-0.5">
                  {stats.recent_reading.map((test: any) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{test.passage__title || 'Reading Test'}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(test.created_at)}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ml-3 flex-shrink-0 ${
                        test.score >= 7 ? 'text-emerald-600' :
                        test.score >= 5 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {formatBandScore(test.score)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <BookOpen className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No reading tests yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
