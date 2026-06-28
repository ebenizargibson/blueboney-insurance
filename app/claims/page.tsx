'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutShell } from '../layout-shell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { claimsApi } from '@/lib/api'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { CLAIM_STATUS_COLORS } from '@/lib/constants'
import type { InsClaim } from '@/types/insurance'

const STATUS_TABS = [
  'all',
  'received',
  'pending_info',
  'under_review',
  'adjudicated',
  'paid',
  'denied',
  'appealed',
  'voided',
]

export default function ClaimsPage() {
  const router = useRouter()
  const [claims, setClaims] = useState<InsClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    setLoading(true)
    claimsApi
      .list({
        status: activeTab !== 'all' ? activeTab : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: 50,
      })
      .then((r) => {
        const data = r as Record<string, unknown>
        setClaims((data.claims ?? data.data ?? []) as InsClaim[])
      })
      .catch(() => setClaims([]))
      .finally(() => setLoading(false))
  }, [activeTab, dateFrom, dateTo])

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'claim_number',
      header: 'Claim #',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-teal-700">
          {String(row.claim_number ?? '—')}
        </span>
      ),
    },
    {
      key: 'member_name',
      header: 'Member',
      render: (row) => String(row.member_name ?? '—'),
    },
    {
      key: 'provider_name',
      header: 'Provider',
      render: (row) =>
        String(row.provider_name ?? row.facility_name ?? '—'),
    },
    {
      key: 'service_from_date',
      header: 'DOS',
      render: (row) => formatDate(row.service_from_date as string | null),
    },
    {
      key: 'total_billed',
      header: 'Billed',
      render: (row) =>
        formatCurrency(row.total_billed as number | null),
    },
    {
      key: 'total_allowed',
      header: 'Allowed',
      render: (row) =>
        formatCurrency(row.total_allowed as number | null),
    },
    {
      key: 'total_plan_payment',
      header: 'Plan Payment',
      render: (row) =>
        formatCurrency(row.total_plan_payment as number | null),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          label={String(row.status ?? '')}
          className={
            CLAIM_STATUS_COLORS[String(row.status)] ??
            'bg-gray-100 text-gray-600'
          }
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/claims/${row.id}`)
          }}
          className="text-xs text-teal-700 hover:underline font-medium"
        >
          View
        </button>
      ),
    },
  ]

  return (
    <LayoutShell breadcrumb={['Claims']}>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">Claims</h1>

        {/* Date range filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 text-sm">
            <label className="text-gray-500">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label className="text-gray-500">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 flex-wrap border-b border-gray-200 pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 -mb-px transition-colors capitalize',
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
          rows={claims as unknown as Record<string, unknown>[]}
          loading={loading}
          emptyMessage="No claims found."
          onRowClick={(row) => router.push(`/claims/${row.id}`)}
        />
      </div>
    </LayoutShell>
  )
}
