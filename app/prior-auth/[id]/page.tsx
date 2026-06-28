'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { LayoutShell } from '../../layout-shell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { paApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { formatDate, cn } from '@/lib/utils'
import { PA_STATUS_COLORS } from '@/lib/constants'
import type { InsPA } from '@/types/insurance'

const DECIDABLE_STATUSES = ['submitted', 'pending_info', 'under_review']

export default function PriorAuthDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { staff } = useAuth()
  const [pa, setPa] = useState<InsPA | null>(null)
  const [events, setEvents] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [decision, setDecision] = useState('')
  const [notes, setNotes] = useState('')
  const [deciding, setDeciding] = useState(false)

  useEffect(() => {
    Promise.all([paApi.get(id), paApi.getEvents(id)])
      .then(([paRes, evRes]) => {
        const paData = paRes as Record<string, unknown>
        const evData = evRes as Record<string, unknown>
        setPa((paData.request ?? paData.data ?? paData) as InsPA)
        setEvents(
          (evData.events ?? evData.data ?? []) as Record<string, unknown>[],
        )
      })
      .catch(() => {
        setPa(null)
        setEvents([])
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleDecide(e: React.FormEvent) {
    e.preventDefault()
    if (!decision) return
    setDeciding(true)
    try {
      await paApi.decide(id, { decision, notes })
      const updated = await paApi.get(id)
      const d = updated as Record<string, unknown>
      setPa((d.request ?? d.data ?? d) as InsPA)
    } catch {
      // ignore
    } finally {
      setDeciding(false)
    }
  }

  return (
    <LayoutShell
      breadcrumb={['Prior Authorization', pa?.pa_number ?? '…']}
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </div>
      ) : !pa ? (
        <div className="text-center py-12 text-sm text-gray-500">
          Prior auth not found.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-mono">
                  {pa.pa_number}
                </h1>
                <p className="text-sm text-gray-500 mt-1 capitalize">
                  {pa.service_type.replace(/_/g, ' ')} —{' '}
                  <span className="font-medium">{pa.member_name ?? pa.member_id}</span>
                </p>
              </div>
              <StatusBadge
                label={pa.status}
                className={
                  PA_STATUS_COLORS[pa.status] ?? 'bg-gray-100 text-gray-600'
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clinical details */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="font-semibold text-gray-800">Clinical Details</h2>
              <Detail label="Priority" value={pa.priority} />
              <Detail
                label="Requesting Provider"
                value={
                  pa.requesting_provider_name ??
                  pa.requesting_provider_npi ??
                  null
                }
              />
              <Detail label="Provider" value={pa.provider_name ?? null} />
              <Detail
                label="Service Codes"
                value={pa.service_codes.join(', ') || null}
              />
              <Detail
                label="Diagnosis Codes"
                value={pa.icd10_codes.join(', ') || null}
              />
              <Detail
                label="Requested Units"
                value={pa.requested_units != null ? String(pa.requested_units) : null}
              />
              <Detail
                label="Approved Units"
                value={pa.approved_units != null ? String(pa.approved_units) : null}
              />
              <Detail
                label="Requested Dates"
                value={
                  pa.requested_start_date
                    ? `${formatDate(pa.requested_start_date)} — ${formatDate(pa.requested_end_date)}`
                    : null
                }
              />
              {pa.clinical_notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Clinical Notes
                  </p>
                  <p className="text-sm text-gray-700 rounded-lg bg-gray-50 p-3">
                    {pa.clinical_notes}
                  </p>
                </div>
              )}
              {pa.denial_reason && (
                <div>
                  <p className="text-xs font-medium text-red-500 mb-1">
                    Denial Reason
                  </p>
                  <p className="text-sm text-red-700 rounded-lg bg-red-50 p-3">
                    {pa.denial_reason}
                  </p>
                </div>
              )}
            </div>

            {/* Decision panel + Timeline */}
            <div className="space-y-6">
              {/* Decision panel */}
              {staff?.canManagePA &&
                DECIDABLE_STATUSES.includes(pa.status) && (
                  <div className="rounded-xl border border-teal-200 bg-teal-50 p-5 shadow-sm">
                    <h2 className="font-semibold text-teal-800 mb-4">
                      Make a Decision
                    </h2>
                    <form onSubmit={handleDecide} className="space-y-3">
                      <select
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
                      >
                        <option value="">Select decision…</option>
                        <option value="approved">Approved</option>
                        <option value="partially_approved">
                          Partially Approved
                        </option>
                        <option value="denied">Denied</option>
                        <option value="pending_info">Request More Info</option>
                      </select>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Decision notes…"
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={deciding || !decision}
                        className="w-full rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50 transition-colors"
                      >
                        {deciding ? 'Submitting…' : 'Submit Decision'}
                      </button>
                    </form>
                  </div>
                )}

              {/* Event timeline */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-4">Timeline</h2>
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
        </div>
      )}
    </LayoutShell>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right max-w-xs truncate">
        {value ?? '—'}
      </span>
    </div>
  )
}
