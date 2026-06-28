'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { LayoutShell } from '../layout-shell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { membersApi } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import { MEMBER_STATUS_COLORS } from '@/lib/constants'
import type { InsMember } from '@/types/insurance'

const STATUS_OPTIONS = [
  'all',
  'active',
  'inactive',
  'suspended',
  'terminated',
  'cobra',
  'pending_activation',
]

export default function MembersPage() {
  const router = useRouter()
  const [members, setMembers] = useState<InsMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    setLoading(true)
    membersApi
      .list({
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        limit: 50,
      })
      .then((r) => {
        const data = r as Record<string, unknown>
        setMembers(
          ((data.members ?? data.data ?? []) as InsMember[]),
        )
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [search, status])

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'member_number',
      header: 'Member #',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-teal-700">
          {String(row.member_number ?? '—')}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <span className="font-medium text-gray-900">
          {`${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || '—'}
        </span>
      ),
    },
    { key: 'plan_name', header: 'Plan' },
    {
      key: 'enrollment_type',
      header: 'Enrollment Type',
      render: (row) => (
        <span className="capitalize">{String(row.enrollment_type ?? '—').replace(/_/g, ' ')}</span>
      ),
    },
    {
      key: 'effective_date',
      header: 'Effective',
      render: (row) => formatDate(row.effective_date as string | null),
    },
    {
      key: 'termination_date',
      header: 'Termination',
      render: (row) =>
        row.termination_date
          ? formatDate(row.termination_date as string)
          : <span className="text-gray-400">—</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          label={String(row.status ?? '')}
          className={
            MEMBER_STATUS_COLORS[String(row.status)] ??
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
            router.push(`/members/${row.id}`)
          }}
          className="text-xs text-teal-700 hover:underline font-medium"
        >
          View
        </button>
      ),
    },
  ]

  return (
    <LayoutShell breadcrumb={['Members']}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or member number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
                  status === s
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400',
                )}
              >
                {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={members as unknown as Record<string, unknown>[]}
          loading={loading}
          emptyMessage="No members found."
          onRowClick={(row) => router.push(`/members/${row.id}`)}
        />
      </div>
    </LayoutShell>
  )
}
