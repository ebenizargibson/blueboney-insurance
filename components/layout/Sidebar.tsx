'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileText,
  CreditCard,
  Building2,
  Heart,
  AlertTriangle,
  BarChart3,
  Settings,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/prior-auth', label: 'Prior Auth', icon: ClipboardCheck },
  { href: '/claims', label: 'Claims', icon: FileText },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/providers', label: 'Providers', icon: Building2 },
  { href: '/care', label: 'Care Management', icon: Heart },
  { href: '/fraud', label: 'Fraud & Appeals', icon: AlertTriangle },
  { href: '/quality', label: 'Quality', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col bg-teal-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-teal-800">
        <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">Blue Boney</p>
          <p className="text-xs text-teal-400 truncate">Insurance Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-teal-700 text-white'
                      : 'text-teal-200 hover:bg-teal-800 hover:text-white',
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-teal-800 px-4 py-4">
        <p className="text-xs text-teal-500 text-center">
          Blue Boney Insurance v0.1
        </p>
      </div>
    </aside>
  )
}
