'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutShell } from '../layout-shell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { paApi } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import { PA_STATUS_COLORS } from '@/lib/constants'
import type { InsPA } from '@/types/insurance'

const STATUS_TABS = [
  'all',
  'submitted',
  'pending_info',
  'under_review',
  'approved',
  'partially_approved',
  'denied',
  'expired',
]

const PRIORITY_COLORS: Record<string, string> = {
  routine: 'bg-gray-100 text-gray-600',
  urgent: 'bg-amber-100 text-amber-800',
  stat: 'bg-red-100 text-red-800',
}

export default function PriorAuthPage() {
  const router = useRouter()
  const [pas, setPas] = useState<InsPA[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    setLoading(true)
    paApi
      .list({
        status: activeTab !== 'all' ? activeTab : undefined,
        limit: 50,
      })
      .then((r) => {
        const data = r as Record<string, unknown>
        setPas((data.requests ?? data.data ?? []) as InsPA[])
      })
      .catch(() => setPas([]))
      .finally(() => setLoading(false))
  }, [activeTab])

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'pa_number',
      header: 'PA #',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-teal-700">
          {String(row.pa_number ?? '—')}
        </span>
      ),
    },
    {
      key: 'member_name',
      header: 'Member',
      render: (row) => String(row.member_name ?? '—'),
    },
    {
      key: 'service_type',
      header: 'Service Type',
      render: (row) => (
        <span className="capitalize">
          {String(row.service_type ?? '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => (
        <StatusBadge
          label={String(row.priority ?? '')}
          className={
            PRIORITY_COLORS[String(row.priority)] ?? 'bg-gray-100 text-gray-600'
          }
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          label={String(row.status ?? '')}
          className={
            PA_STATUS_COLORS[String(row.status)] ?? 'bg-gray-100 text-gray-600'
          }
        />
      ),
    },
    {
      key: 'decided_at',
      header: 'Decision Date',
      render: (row) => formatDate(row.decided_at as string | null),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/prior-auth/${row.id}`)
          }}
          className="text-xs text-teal-700 hover:underline font-medium"
        >
          View
        </button>
      ),
    },
  ]

  return (
    <LayoutShell breadcrumb={['Prior Authorization']}>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">Prior Authorizations</h1>

        {/* Status filter tabs */}
        <div className="flex gap-1 flex-wrap border-b border-gray-200 pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors capitalize',
                activeTab === tab
                  ? 'border-teal-600 text-teal-700 bg-teal-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {tab === 'all' ? 'All' : tab.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          rows={pas as unknown as Record<string, unknown>[]}
          loading={loading}
          emptyMessage="No prior authorizations found."
          onRowClick={(row) => router.push(`/prior-auth/${row.id}`)}
        />
      </div>
    </LayoutShell>
  )
}
