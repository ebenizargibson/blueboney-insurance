'use client'

import { useRouter } from 'next/navigation'
import { LogOut, ChevronRight, User } from 'lucide-react'
import { authApi } from '@/lib/api'
import type { InsStaff } from '@/lib/auth'

interface HeaderProps {
  breadcrumb?: string[]
  staff: InsStaff | null
}

export function Header({ breadcrumb = [], staff }: HeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    try {
      await authApi.logout()
    } catch {
      // ignore errors
    }
    router.push('/login')
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            <span
              className={
                i === breadcrumb.length - 1
                  ? 'font-medium text-gray-900'
                  : 'text-gray-500'
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* User menu */}
      <div className="flex items-center gap-3">
        {staff && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-teal-700" />
            </div>
            <span className="hidden sm:inline font-medium">{staff.fullName}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
