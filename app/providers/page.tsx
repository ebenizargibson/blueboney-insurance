'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { LayoutShell } from '../layout-shell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { providersApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { InsProvider } from '@/types/insurance'

const TIER_OPTIONS = ['all', 'in_network', 'preferred', 'out_of_network', 'tier_1', 'tier_2']

const TIER_COLORS: Record<string, string> = {
  preferred: 'bg-green-100 text-green-800',
  in_network: 'bg-teal-100 text-teal-800',
  tier_1: 'bg-blue-100 text-blue-800',
  tier_2: 'bg-cyan-100 text-cyan-800',
  out_of_network: 'bg-gray-100 text-gray-600',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  suspended: 'bg-amber-100 text-amber-800',
  terminated: 'bg-red-100 text-red-800',
  pending: 'bg-purple-100 text-purple-800',
}

export default function ProvidersPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<InsProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('all')
  const [specialty, setSpecialty] = useState('')

  useEffect(() => {
    setLoading(true)
    providersApi
      .list({
        search: search || undefined,
        network_tier: tier !== 'all' ? tier : undefined,
        specialty: specialty || undefined,
        limit: 50,
      })
      .then((r) => {
        const data = r as Record<string, unknown>
        setProviders((data.providers ?? data.data ?? []) as InsProvider[])
      })
      .catch(() => setProviders([]))
      .finally(() => setLoading(false))
  }, [search, tier, specialty])

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'legal_name',
      header: 'Name',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {String(row.legal_name ?? '—')}
          </p>
          {row.doing_business_as && (
            <p className="text-xs text-gray-400">
              dba {String(row.doing_business_as)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'provider_type',
      header: 'Type',
      render: (row) => (
        <span className="capitalize text-sm">
          {String(row.provider_type ?? '').replace(/_/g, ' ')}
        </span>
      ),
    },
    { key: 'npi', header: 'NPI' },
    {
      key: 'specialty_primary',
      header: 'Specialty',
      render: (row) =>
        row.specialty_primary
          ? (
            <span className="capitalize">
              {String(row.specialty_primary).replace(/_/g, ' ')}
            </span>
          )
          : <span className="text-gray-400">—</span>,
    },
    {
      key: 'network_tier',
      header: 'Network Tier',
      render: (row) => (
        <StatusBadge
          label={String(row.network_tier ?? '')}
          className={
            TIER_COLORS[String(row.network_tier)] ?? 'bg-gray-100 text-gray-600'
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
            STATUS_COLORS[String(row.status)] ?? 'bg-gray-100 text-gray-600'
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
            router.push(`/providers/${row.id}`)
          }}
          className="text-xs text-teal-700 hover:underline font-medium"
        >
          View
        </button>
      ),
    },
  ]

  return (
    <LayoutShell breadcrumb={['Providers']}>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">Provider Network</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or NPI…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <input
            type="text"
            placeholder="Specialty…"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="sm:w-48 px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-teal-500"
          />
        </div>

        {/* Tier filter */}
        <div className="flex gap-2 flex-wrap">
          {TIER_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize',
                tier === t
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400',
              )}
            >
              {t === 'all' ? 'All Tiers' : t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          rows={providers as unknown as Record<string, unknown>[]}
          loading={loading}
          emptyMessage="No providers found."
          onRowClick={(row) => router.push(`/providers/${row.id}`)}
        />
      </div>
    </LayoutShell>
  )
}
