'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, PenTool, Mic, BookOpen, Trophy,
  TrendingUp, Users, BarChart3, Settings, FileText
} from 'lucide-react'

const studentLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/writing', label: 'Writing Practice', icon: PenTool },
  { href: '/speaking', label: 'Speaking Practice', icon: Mic },
  { href: '/reading', label: 'Reading Practice', icon: BookOpen },
  { href: '/results', label: 'My Results', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: Settings },
]

const adminLinks = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/writing', label: 'Writing Tests', icon: PenTool },
  { href: '/speaking', label: 'Speaking Tests', icon: Mic },
  { href: '/reading', label: 'Reading Tests', icon: BookOpen },
  { href: '/profile', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const links = user?.role === 'admin' ? adminLinks : studentLinks

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed top-16 bottom-0 left-0 overflow-y-auto">
      <div className="p-4">
        <div className="bg-primary-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">
            {user?.role === 'admin' ? 'Admin Panel' : 'Student Portal'}
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
          </p>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/dashboard' && link.href !== '/admin' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn('h-5 w-5 mr-3', isActive ? 'text-primary-600' : 'text-gray-400')} />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
