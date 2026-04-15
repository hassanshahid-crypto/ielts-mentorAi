'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, PenTool, Mic, BookOpen, Trophy,
  Users, Settings, LogOut, ChevronRight, Sparkles, BarChart3
} from 'lucide-react'

const studentLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  
  { href: '/writing', label: 'Writing Lab', icon: PenTool },
  { href: '/speaking', label: 'Speaking Club', icon: Mic },
  { href: '/reading', label: 'Reading Practice', icon: BookOpen },
  { href: '/results', label: 'Vocabulary', icon: Trophy },
  { href: '/performance', label: 'Performance', icon: BarChart3 },
]

const adminLinks = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/writing', label: 'Writing Tests', icon: PenTool },
  { href: '/admin/speaking', label: 'Speaking Tests', icon: Mic },
  { href: '/admin/reading', label: 'Reading Tests', icon: BookOpen },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const isAdmin = user?.role === 'admin'
  const links = isAdmin ? adminLinks : studentLinks

  return (
    <aside className="hidden lg:flex lg:flex-col w-[220px] bg-white border-r border-gray-100 fixed top-16 bottom-0 left-0 overflow-y-auto">
      <div className="flex flex-col h-full">
        {/* Nav links */}
        <div className="flex-1 px-3 py-5">
          {isAdmin && (
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest px-3 mb-3">Management</p>
          )}
          <nav className="space-y-0.5">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || (link.href !== '/dashboard' && link.href !== '/admin' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon className={cn(
                    'h-[18px] w-[18px] flex-shrink-0 transition-colors',
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  )} />
                  <span className="flex-1">{link.label}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary-400" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="px-3 py-3 border-t border-gray-50">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all mb-1">
            <Settings className="h-4 w-4 text-gray-400" /> Settings
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all w-full text-left">
            <LogOut className="h-4 w-4 text-gray-400" /> Logout
          </button>
          {/* User profile */}
          <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-xl">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-xs font-bold text-white">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
