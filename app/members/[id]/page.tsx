'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { LayoutShell } from '../../layout-shell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { membersApi } from '@/lib/api'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { MEMBER_STATUS_COLORS } from '@/lib/constants'
import type { InsMember } from '@/types/insurance'

const TABS = ['Overview', 'Eligibility Checks', 'Enrollment History']

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [member, setMember] = useState<InsMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')

  useEffect(() => {
    membersApi
      .get(id)
      .then((r) => {
        const data = r as Record<string, unknown>
        setMember((data.member ?? data.data ?? data) as InsMember)
      })
      .catch(() => setMember(null))
      .finally(() => setLoading(false))
  }, [id])

  const name = member
    ? `${member.first_name} ${member.last_name}`.trim()
    : '…'

  return (
    <LayoutShell breadcrumb={['Members', name]}>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </div>
      ) : !member ? (
        <div className="text-center py-12 text-sm text-gray-500">
          Member not found.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                <p className="text-sm text-gray-500 font-mono mt-1">
                  {member.member_number}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{member.email}</p>
              </div>
              <StatusBadge
                label={member.status}
                className={
                  MEMBER_STATUS_COLORS[member.status] ??
                  'bg-gray-100 text-gray-600'
                }
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-1">
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
          </div>

          {/* Tab content */}
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coverage */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-800">Coverage</h2>
                <InfoRow label="Plan" value={member.plan_name} />
                <InfoRow label="Group ID" value={member.group_id} />
                <InfoRow
                  label="Enrollment Type"
                  value={member.enrollment_type.replace(/_/g, ' ')}
                />
                <InfoRow
                  label="Effective Date"
                  value={formatDate(member.effective_date)}
                />
                <InfoRow
                  label="Termination Date"
                  value={formatDate(member.termination_date)}
                />

                {/* Deductible progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Deductible Met</span>
                    <span>{formatCurrency(member.deductible_met)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-teal-500"
                      style={{
                        width: `${Math.min(100, (member.deductible_met / 2000) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* OOP progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Out-of-Pocket Met</span>
                    <span>{formatCurrency(member.oop_met)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.min(100, (member.oop_met / 6000) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-800">Demographics</h2>
                <InfoRow label="Date of Birth" value={formatDate(member.date_of_birth)} />
                <InfoRow label="Gender" value={member.gender} />
                <InfoRow label="Phone" value={member.phone} />
                <InfoRow label="Email" value={member.email} />
                <InfoRow
                  label="Address"
                  value={
                    [
                      member.address_line1,
                      member.city,
                      member.state_province,
                      member.country,
                    ]
                      .filter(Boolean)
                      .join(', ') || null
                  }
                />
                {member.risk_score != null && (
                  <InfoRow
                    label="Risk Score"
                    value={member.risk_score.toFixed(2)}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'Eligibility Checks' && (
            <EligibilityTab memberId={id} />
          )}

          {activeTab === 'Enrollment History' && (
            <EnrollmentHistoryTab memberId={id} />
          )}
        </div>
      )}
    </LayoutShell>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">
        {value ?? '—'}
      </span>
    </div>
  )
}

function EligibilityTab({ memberId }: { memberId: string }) {
  const [checks, setChecks] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    membersApi
      .getEligibility(memberId)
      .then((r) => {
        const data = r as Record<string, unknown>
        setChecks((data.checks ?? data.data ?? []) as Record<string, unknown>[])
      })
      .catch(() => setChecks([]))
      .finally(() => setLoading(false))
  }, [memberId])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  if (checks.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        No eligibility checks recorded.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Checked At', 'Service Date', 'Result', 'Checked By'].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {checks.map((c, i) => (
            <tr key={i}>
              <td className="px-4 py-3">{formatDate(c.checked_at as string)}</td>
              <td className="px-4 py-3">{formatDate(c.service_date as string)}</td>
              <td className="px-4 py-3">
                <StatusBadge
                  label={String(c.result ?? 'unknown')}
                  className={
                    c.result === 'eligible'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {String(c.checked_by ?? '—')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EnrollmentHistoryTab({ memberId }: { memberId: string }) {
  const [events, setEvents] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    membersApi
      .getEnrollmentEvents(memberId)
      .then((r) => {
        const data = r as Record<string, unknown>
        setEvents((data.events ?? data.data ?? []) as Record<string, unknown>[])
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [memberId])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        No enrollment events recorded.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {events.map((ev, i) => (
        <div
          key={i}
          className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-teal-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {String(ev.event_type ?? '').replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDate(ev.occurred_at as string)}
              {ev.notes ? ` — ${ev.notes}` : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
