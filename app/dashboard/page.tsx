'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  CreditCard,
  Heart,
  Scale,
  Shield,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { LayoutShell } from '../layout-shell'
import { KPICard } from '@/components/shared/KPICard'
import { dashboardApi } from '@/lib/api'
import { formatCurrency, formatNumber, formatPct } from '@/lib/utils'
import type { InsDashboardKPIs } from '@/types/insurance'

const CLAIMS_CHART_DATA = [
  { status: 'Received', count: 0 },
  { status: 'Under Review', count: 0 },
  { status: 'Adjudicated', count: 0 },
  { status: 'Paid', count: 0 },
  { status: 'Denied', count: 0 },
]

export default function DashboardPage() {
  const [kpis, setKpis] = useState<InsDashboardKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dashboardApi
      .getKPIs()
      .then((r) => {
        const data = r as Record<string, unknown>
        setKpis((data.kpis ?? data.data ?? data) as InsDashboardKPIs)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const claimsChartData = kpis
    ? [
        { status: 'Received', count: kpis.claims_received_30d },
        { status: 'Pending', count: kpis.pending_claims },
        { status: 'Paid', count: kpis.claims_paid_30d_count },
        { status: 'Denied', count: kpis.claims_denied_30d },
      ]
    : CLAIMS_CHART_DATA

  return (
    <LayoutShell breadcrumb={['Dashboard']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Insurance payer operations overview
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Row 1 KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            title="Active Members"
            value={loading ? '…' : formatNumber(kpis?.active_members)}
            icon={Users}
          />
          <KPICard
            title="Pending Claims"
            value={loading ? '…' : formatNumber(kpis?.pending_claims)}
            icon={FileText}
          />
          <KPICard
            title="Open Prior Auths"
            value={loading ? '…' : formatNumber(kpis?.open_pas)}
            icon={ClipboardCheck}
          />
          <KPICard
            title="Open Fraud Flags"
            value={loading ? '…' : formatNumber(kpis?.open_fraud_flags)}
            icon={AlertTriangle}
          />
        </div>

        {/* Row 2 KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            title="Claims Paid (30d)"
            value={loading ? '…' : formatCurrency(kpis?.claims_paid_30d_amount)}
            subtitle={`${formatNumber(kpis?.claims_paid_30d_count)} claims`}
            icon={CreditCard}
          />
          <KPICard
            title="Premiums Outstanding"
            value={loading ? '…' : formatCurrency(kpis?.premiums_outstanding)}
            icon={Shield}
          />
          <KPICard
            title="Appeals Open"
            value={loading ? '…' : formatNumber(kpis?.appeals_open)}
            icon={Scale}
          />
          <KPICard
            title="High-Risk Care Cases"
            value={loading ? '…' : formatNumber(kpis?.high_risk_care_cases)}
            icon={Heart}
          />
        </div>

        {/* Row 3 — Metrics + Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Performance metrics */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Performance Metrics
            </h2>
            <MetricRow
              label="Denial Rate (30d)"
              value={loading ? '…' : formatPct(kpis?.denial_rate_30d)}
            />
            <MetricRow
              label="Avg Processing Days"
              value={
                loading
                  ? '…'
                  : kpis?.avg_claims_processing_days != null
                  ? `${kpis.avg_claims_processing_days.toFixed(1)} days`
                  : '—'
              }
            />
            <MetricRow
              label="PA Approval Rate"
              value={loading ? '…' : formatPct(kpis?.pa_approval_rate)}
            />
            <MetricRow
              label="Fraud Recovery YTD"
              value={loading ? '…' : formatCurrency(kpis?.fraud_recovery_ytd)}
            />
          </div>

          {/* Claims chart */}
          <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Claims by Status (30 days)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={claimsChartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </LayoutShell>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
