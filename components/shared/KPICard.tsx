import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface TrendProps {
  value: string
  direction: 'up' | 'down' | 'neutral'
}

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: TrendProps
  className?: string
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-500 truncate">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                trend.direction === 'up' && 'text-green-600',
                trend.direction === 'down' && 'text-red-600',
                trend.direction === 'neutral' && 'text-gray-500',
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-4 flex-shrink-0 w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-teal-700" />
          </div>
        )}
      </div>
    </div>
  )
}
