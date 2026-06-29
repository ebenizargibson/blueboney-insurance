'use client'

import { useEffect, useState } from 'react'
import { LayoutShell } from '../layout-shell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { fraudApi, appealsApi } from '@/lib/api'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { FRAUD_SEVERITY_COLORS } from '@/lib/constants'
import type { InsFraudFlag, InsAppeal } from '@/types/insurance'

const TABS = ['Fraud Flags', 'Appeals']

const FRAUD_STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  under_investigation: 'bg-purple-100 text-purple-800',
  substantiated: 'bg-red-100 text-red-800',
  unsubstantiated: 'bg-gray-100 text-gray-600',
  referred: 'bg-amber-100 text-amber-800',
  closed: 'bg-green-100 text-green-800',
}

const APPEAL_STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-purple-100 text-purple-800',
  upheld: 'bg-green-100 text-green-800',
  overturned: 'bg-amber-100 text-amber-800',
  partially_upheld: 'bg-teal-100 text-teal-800',
  withdrawn: 'bg-gray-100 text-gray-600',
}

export default function FraudPage() {
  const [activeTab, setActiveTab] = useState('Fraud Flags')
  const [flags, setFlags] = useState<InsFraudFlag[]>([])
  const [appeals, setAppeals] = useState<InsAppeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (activeTab === 'Fraud Flags') {
      fraudApi
        .list({ limit: 50 })
        .then((r) => {
          const data = r as Record<string, unknown>
          setFlags((data.flags ?? data.data ?? []) as InsFraudFlag[])
        })
        .catch(() => setFlags([]))
        .finally(() => setLoading(false))
    } else {
      appealsApi
        .list({ limit: 50 })
        .then((r) => {
          const data = r as Record<string, unknown>
          setAppeals((data.appeals ?? data.data ?? []) as InsAppeal[])
        })
        .catch(() => setAppeals([]))
        .finally(() => setLoading(false))
    }
  }, [activeTab])

  const fraudColumns: Column<Record<string, unknown>>[] = [
    {
      key: 'entity_name',
      header: 'Entity',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {String(row.entity_name ?? '—')}
          </p>
          <p className="text-xs text-gray-400 capitalize">
            {String(row.entity_type ?? '')}
          </p>
        </div>
      ),
    },
    {
      key: 'flag_type',
      header: 'Flag Type',
      render: (row) => (
        <span className="capitalize">
          {String(row.flag_type ?? '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (row) => (
        <StatusBadge
          label={String(row.severity ?? '')}
          className={
            FRAUD_SEVERITY_COLORS[String(row.severity)] ??
            'bg-gray-100 text-gray-600'
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
            FRAUD_STATUS_COLORS[String(row.status)] ??
            'bg-gray-100 text-gray-600'
          }
        />
      ),
    },
    {
      key: 'estimated_exposure',
      header: 'Exposure',
      render: (row) =>
        formatCurrency(row.estimated_exposure as number | null),
    },
    {
      key: 'detection_method',
      header: 'Detection',
      render: (row) => (
        <span className="capitalize text-xs text-gray-500">
          {String(row.detection_method ?? '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Flagged',
      render: (row) => formatDate(row.created_at as string | null),
    },
  ]

  const appealColumns: Column<Record<string, unknown>>[] = [
    {
      key: 'appeal_number',
      header: 'Appeal #',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-teal-700">
          {String(row.appeal_number ?? '—')}
        </span>
      ),
    },
    {
      key: 'appeal_type',
      header: 'Type',
      render: (row) => (
        <span className="capitalize">
          {String(row.appeal_type ?? '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => (
        <span className="capitalize text-sm">{String(row.priority ?? '—')}</span>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: (row) => `Level ${row.level ?? 1}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          label={String(row.status ?? '')}
          className={
            APPEAL_STATUS_COLORS[String(row.status)] ??
            'bg-gray-100 text-gray-600'
          }
        />
      ),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (row) => {
        const deadline = row.deadline as string | null
        if (!deadline) return <span className="text-gray-400">—</span>
        const isNear =
          new Date(deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
        return (
          <span className={isNear ? 'text-red-600 font-semibold' : ''}>
            {formatDate(deadline)}
          </span>
        )
      },
    },
    {
      key: 'decided_at',
      header: 'Decision Date',
      render: (row) => formatDate(row.decided_at as string | null),
    },
  ]

  return (
    <LayoutShell breadcrumb={['Fraud & Appeals']}>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">Fraud & Appeals</h1>

        <div className="flex gap-1 border-b border-gray-200 pb-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Fraud Flags' && (
          <DataTable
            columns={fraudColumns}
            rows={flags as unknown as Record<string, unknown>[]}
            loading={loading}
            emptyMessage="No fraud flags found."
          />
        )}
        {activeTab === 'Appeals' && (
          <DataTable
            columns={appealColumns}
            rows={appeals as unknown as Record<string, unknown>[]}
            loading={loading}
            emptyMessage="No appeals found."
          />
        )}
      </div>
    </LayoutShell>
  )
}
