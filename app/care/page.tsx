'use client'

import { useEffect, useState } from 'react'
import { LayoutShell } from '../layout-shell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { careApi } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import type { InsCareCase } from '@/types/insurance'

const TABS = ['Cases', 'Gaps in Care', 'Risk Scores']

const CASE_STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  active: 'bg-teal-100 text-teal-800',
  on_hold: 'bg-amber-100 text-amber-800',
  closed: 'bg-gray-100 text-gray-600',
  escalated: 'bg-red-100 text-red-800',
}

const PRIORITY_COLORS: Record<string, string> = {
  routine: 'bg-gray-100 text-gray-600',
  high: 'bg-amber-100 text-amber-800',
  urgent: 'bg-red-100 text-red-800',
}

const GAP_STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  outreach_sent: 'bg-purple-100 text-purple-800',
  closed: 'bg-gray-100 text-gray-600',
  excluded: 'bg-amber-100 text-amber-800',
}

export default function CarePage() {
  const [activeTab, setActiveTab] = useState('Cases')
  const [cases, setCases] = useState<InsCareCase[]>([])
  const [gaps, setGaps] = useState<Record<string, unknown>[]>([])
  const [riskScores, setRiskScores] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (activeTab === 'Cases') {
      careApi
        .listCases({ limit: 50 })
        .then((r) => {
          const data = r as Record<string, unknown>
          setCases((data.cases ?? data.data ?? []) as InsCareCase[])
        })
        .catch(() => setCases([]))
        .finally(() => setLoading(false))
    } else if (activeTab === 'Gaps in Care') {
      careApi
        .listGaps({ limit: 50 })
        .then((r) => {
          const data = r as Record<string, unknown>
          setGaps((data.gaps ?? data.data ?? []) as Record<string, unknown>[])
        })
        .catch(() => setGaps([]))
        .finally(() => setLoading(false))
    } else {
      careApi
        .listRiskScores({ limit: 50 })
        .then((r) => {
          const data = r as Record<string, unknown>
          setRiskScores(
            (data.risk_scores ?? data.data ?? []) as Record<string, unknown>[],
          )
        })
        .catch(() => setRiskScores([]))
        .finally(() => setLoading(false))
    }
  }, [activeTab])

  const caseColumns: Column<Record<string, unknown>>[] = [
    {
      key: 'case_number',
      header: 'Case #',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-teal-700">
          {String(row.case_number ?? '—')}
        </span>
      ),
    },
    {
      key: 'member_name',
      header: 'Member',
      render: (row) => String(row.member_name ?? '—'),
    },
    {
      key: 'case_type',
      header: 'Type',
      render: (row) => (
        <span className="capitalize">
          {String(row.case_type ?? '').replace(/_/g, ' ')}
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
            CASE_STATUS_COLORS[String(row.status)] ??
            'bg-gray-100 text-gray-600'
          }
        />
      ),
    },
    {
      key: 'assigned_cm',
      header: 'Care Manager',
      render: (row) => String(row.assigned_cm ?? '—'),
    },
    {
      key: 'opened_at',
      header: 'Opened',
      render: (row) => formatDate(row.opened_at as string | null),
    },
    {
      key: 'target_close_date',
      header: 'Target Close',
      render: (row) => formatDate(row.target_close_date as string | null),
    },
  ]

  const gapColumns: Column<Record<string, unknown>>[] = [
    {
      key: 'member_name',
      header: 'Member',
      render: (row) => String(row.member_name ?? '—'),
    },
    {
      key: 'measure_code',
      header: 'Measure',
      render: (row) => (
        <span className="font-mono text-xs">{String(row.measure_code ?? '—')}</span>
      ),
    },
    {
      key: 'gap_description',
      header: 'Description',
      render: (row) => String(row.gap_description ?? '—'),
    },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (row) => formatDate(row.due_date as string | null),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          label={String(row.status ?? '')}
          className={
            GAP_STATUS_COLORS[String(row.status)] ?? 'bg-gray-100 text-gray-600'
          }
        />
      ),
    },
  ]

  const riskColumns: Column<Record<string, unknown>>[] = [
    {
      key: 'member_name',
      header: 'Member',
      render: (row) => String(row.member_name ?? '—'),
    },
    {
      key: 'risk_score',
      header: 'Risk Score',
      render: (row) => (
        <span
          className={cn(
            'font-bold',
            (row.risk_score as number) >= 3
              ? 'text-red-600'
              : (row.risk_score as number) >= 2
              ? 'text-amber-600'
              : 'text-green-600',
          )}
        >
          {typeof row.risk_score === 'number'
            ? row.risk_score.toFixed(2)
            : '—'}
        </span>
      ),
    },
    {
      key: 'risk_tier',
      header: 'Tier',
      render: (row) => (
        <span className="capitalize">{String(row.risk_tier ?? '—')}</span>
      ),
    },
    {
      key: 'calculated_at',
      header: 'Last Calculated',
      render: (row) => formatDate(row.calculated_at as string | null),
    },
    {
      key: 'model_version',
      header: 'Model',
      render: (row) => String(row.model_version ?? '—'),
    },
  ]

  return (
    <LayoutShell breadcrumb={['Care Management']}>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">Care Management</h1>

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

        {activeTab === 'Cases' && (
          <DataTable
            columns={caseColumns}
            rows={cases as unknown as Record<string, unknown>[]}
            loading={loading}
            emptyMessage="No care management cases found."
          />
        )}
        {activeTab === 'Gaps in Care' && (
          <DataTable
            columns={gapColumns}
            rows={gaps}
            loading={loading}
            emptyMessage="No care gaps found."
          />
        )}
        {activeTab === 'Risk Scores' && (
          <DataTable
            columns={riskColumns}
            rows={riskScores}
            loading={loading}
            emptyMessage="No risk scores found."
          />
        )}
      </div>
    </LayoutShell>
  )
}
