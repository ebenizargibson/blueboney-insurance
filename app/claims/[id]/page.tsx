'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { LayoutShell } from '../../layout-shell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { claimsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CLAIM_STATUS_COLORS } from '@/lib/constants'
import type { InsClaim } from '@/types/insurance'

const ADJUDICATABLE_STATUSES = ['received', 'under_review', 'pending_info']

export default function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { staff } = useAuth()
  const [claim, setClaim] = useState<InsClaim | null>(null)
  const [events, setEvents] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [voidReason, setVoidReason] = useState('')
  const [voiding, setVoiding] = useState(false)

  useEffect(() => {
    Promise.all([claimsApi.get(id), claimsApi.getEvents(id)])
      .then(([claimRes, evRes]) => {
        const cd = claimRes as Record<string, unknown>
        const ed = evRes as Record<string, unknown>
        setClaim((cd.claim ?? cd.data ?? cd) as InsClaim)
        setEvents((ed.events ?? ed.data ?? []) as Record<string, unknown>[])
      })
      .catch(() => {
        setClaim(null)
        setEvents([])
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleVoid(e: React.FormEvent) {
    e.preventDefault()
    if (!voidReason.trim()) return
    setVoiding(true)
    try {
      await claimsApi.void(id, { reason: voidReason })
      const updated = await claimsApi.get(id)
      const d = updated as Record<string, unknown>
      setClaim((d.claim ?? d.data ?? d) as InsClaim)
    } catch {
      // ignore
    } finally {
      setVoiding(false)
    }
  }

  return (
    <LayoutShell breadcrumb={['Claims', claim?.claim_number ?? '…']}>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </div>
      ) : !claim ? (
        <div className="text-center py-12 text-sm text-gray-500">
          Claim not found.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-mono">
                  {claim.claim_number}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {claim.member_name ?? claim.member_id} —{' '}
                  {claim.provider_name ?? claim.facility_name ?? 'Unknown provider'}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  DOS: {formatDate(claim.service_from_date)}
                  {claim.service_to_date !== claim.service_from_date &&
                    ` — ${formatDate(claim.service_to_date)}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  label={claim.status}
                  className={
                    CLAIM_STATUS_COLORS[claim.status] ??
                    'bg-gray-100 text-gray-600'
                  }
                />
                <StatusBadge
                  label={claim.claim_type}
                  className="bg-blue-50 text-blue-700"
                />
              </div>
            </div>

            {/* Financial summary */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <FinancialStat
                label="Total Billed"
                value={formatCurrency(claim.total_billed)}
              />
              <FinancialStat
                label="Total Allowed"
                value={formatCurrency(claim.total_allowed)}
              />
              <FinancialStat
                label="Plan Payment"
                value={formatCurrency(claim.total_plan_payment)}
              />
              <FinancialStat
                label="Member Responsibility"
                value={formatCurrency(claim.total_member_responsibility)}
              />
            </div>
          </div>

          {/* Claim lines */}
          {claim.lines && claim.lines.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Claim Lines</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        '#',
                        'CPT',
                        'Description',
                        'DOS',
                        'Units',
                        'Billed',
                        'Allowed',
                        'Plan Pay',
                        'Status',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {claim.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="px-4 py-3 text-gray-500">
                          {line.line_number}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {line.cpt_code ?? line.revenue_code ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                          {line.description ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          {formatDate(line.service_date)}
                        </td>
                        <td className="px-4 py-3">{line.units}</td>
                        <td className="px-4 py-3">
                          {formatCurrency(line.billed_amount)}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(line.allowed_amount)}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(line.plan_payment)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            label={line.status}
                            className={
                              CLAIM_STATUS_COLORS[line.status] ??
                              'bg-gray-100 text-gray-600'
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Void panel */}
            {staff?.canManageClaims &&
              ADJUDICATABLE_STATUSES.includes(claim.status) && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
                  <h2 className="font-semibold text-red-800 mb-3">
                    Void Claim
                  </h2>
                  <form onSubmit={handleVoid} className="space-y-3">
                    <textarea
                      value={voidReason}
                      onChange={(e) => setVoidReason(e.target.value)}
                      placeholder="Reason for voiding…"
                      rows={3}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={voiding || !voidReason.trim()}
                      className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {voiding ? 'Voiding…' : 'Void Claim'}
                    </button>
                  </form>
                </div>
              )}

            {/* Event log */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">Event Log</h2>
              {events.length === 0 ? (
                <p className="text-sm text-gray-500">No events recorded.</p>
              ) : (
                <div className="space-y-3">
                  {events.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-teal-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {String(ev.event_type ?? '').replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(ev.occurred_at as string)}
                          {ev.actor_name ? ` by ${ev.actor_name}` : ''}
                        </p>
                        {ev.notes && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {String(ev.notes)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </LayoutShell>
  )
}

function FinancialStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-base font-bold text-gray-900">{value}</p>
    </div>
  )
}
