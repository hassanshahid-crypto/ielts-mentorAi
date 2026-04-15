'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Menu, X, User, LogOut, BookOpen, Bell, PenTool, Mic, CheckCircle } from 'lucide-react'

interface Notification {
  id: string
  type: 'writing' | 'speaking' | 'reading'
  title: string
  time: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!isAuthenticated) return
    const fetchNotifications = async () => {
      try {
        const data = await api.getDashboard()
        const notifs: Notification[] = []

        data.recent_writing?.forEach((w: any) => {
          notifs.push({
            id: `w-${w.id}`,
            type: 'writing',
            title: `Writing ${w.task_type === 'task1' ? 'Task 1' : 'Task 2'} ${w.status === 'evaluated' ? 'evaluated' : w.status === 'submitted' ? 'submitted' : 'saved as draft'}`,
            time: w.created_at,
          })
        })

        data.recent_speaking?.forEach((s: any) => {
          notifs.push({
            id: `s-${s.id}`,
            type: 'speaking',
            title: `Speaking Part ${s.part_number} ${s.status === 'evaluated' ? 'evaluated' : s.status === 'completed' ? 'completed' : 'in progress'}`,
            time: s.created_at,
          })
        })

        data.recent_reading?.forEach((r: any) => {
          notifs.push({
            id: `r-${r.id}`,
            type: 'reading',
            title: `Reading "${r.passage__title}" completed — Score: ${r.score}`,
            time: r.created_at,
          })
        })

        notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        setNotifications(notifs)
      } catch (err) {
        // silently fail
      }
    }
    fetchNotifications()
  }, [isAuthenticated])

  const notifIcons = {
    writing: PenTool,
    speaking: Mic,
    reading: BookOpen,
  }

  const notifColors = {
    writing: 'bg-blue-50 text-blue-600',
    speaking: 'bg-emerald-50 text-emerald-600',
    reading: 'bg-violet-50 text-violet-600',
  }

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 fixed top-0 left-0 right-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={isAdmin ? '/admin' : isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5">
              <div className="h-8 w-8 bg-primary-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold font-display text-gray-900">IELTS Mentor</span>
                <span className="hidden sm:block text-[10px] text-gray-400 font-medium -mt-0.5 uppercase tracking-wider">Master the Exam</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                {/* Notification bell */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
                    className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary-500 rounded-full" />
                    )}
                  </button>

                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-soft-lg border border-gray-100 z-50 animate-scale-in overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                          <span className="text-[10px] font-medium text-gray-400">{notifications.length} recent</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                              <CheckCircle className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                              <p className="text-sm text-gray-400">No activity yet</p>
                              <p className="text-xs text-gray-300 mt-1">Complete a test to see updates here</p>
                            </div>
                          ) : (
                            notifications.map((notif) => {
                              const Icon = notifIcons[notif.type]
                              const colorClass = notifColors[notif.type]
                              return (
                                <div
                                  key={notif.id}
                                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                >
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass}`}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700 leading-snug">{notif.title}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(notif.time)}</p>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Profile dropdown */}
            {isAuthenticated && !isAdmin ? (
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                  className="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-all"
                >
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-white">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-sm font-semibold text-gray-900 block leading-tight">{user?.first_name || user?.username}</span>
                    <span className="text-[10px] text-gray-400 capitalize">{user?.difficulty_level || 'Student'}</span>
                  </div>
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-soft-lg border border-gray-100 py-1.5 z-50 animate-scale-in">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileOpen(false)}>
                        <User className="h-4 w-4 text-gray-400" /> Profile Settings
                      </Link>
                      <button onClick={logout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : !isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">Login</Link>
                <Link href="/register" className="bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all shadow-sm hover:shadow-md hover:shadow-primary-600/20">Get Started</Link>
              </div>
            ) : null}

            {/* Mobile menu toggle */}
            {!isAdmin && (
              <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && isAuthenticated && !isAdmin && (
        <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl animate-slide-up">
          <div className="px-4 py-3 space-y-0.5">
            {[
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/writing', label: 'Writing Lab' },
              { href: '/speaking', label: 'Speaking Club' },
              { href: '/reading', label: 'Reading Club' },
              { href: '/results', label: 'Vocabulary' },
              { href: '/performance', label: 'Performance' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
