'use client'

import { useEffect, useState } from 'react'
import { LayoutShell } from '../layout-shell'
import { settingsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { formatDate, cn } from '@/lib/utils'
import type { InsStaffRecord } from '@/types/insurance'

const TABS = ['Organization', 'Staff Management', 'Benefit Plans']

export default function SettingsPage() {
  const { staff } = useAuth()
  const [activeTab, setActiveTab] = useState('Organization')

  return (
    <LayoutShell breadcrumb={['Settings']}>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

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

        {activeTab === 'Organization' && <OrgTab />}
        {activeTab === 'Staff Management' && (
          <StaffTab canManage={staff?.isAdmin ?? false} />
        )}
        {activeTab === 'Benefit Plans' && <BenefitPlansTab />}
      </div>
    </LayoutShell>
  )
}

// ─── Org Tab ─────────────────────────────────────────────────────────────────

function OrgTab() {
  const [org, setOrg] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    settingsApi
      .getOrg()
      .then((r) => {
        const data = r as Record<string, unknown>
        setOrg((data.org ?? data.data ?? data) as Record<string, unknown>)
      })
      .catch(() => setOrg(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        Unable to load organization details.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 max-w-xl">
      <h2 className="font-semibold text-gray-800">Organization Details</h2>
      <OrgRow label="Org ID" value={String(org.id ?? '—')} />
      <OrgRow label="Name" value={String(org.name ?? '—')} />
      <OrgRow label="License Number" value={String(org.license_number ?? '—')} />
      <OrgRow label="Country" value={String(org.country ?? '—')} />
      <OrgRow label="Contact Email" value={String(org.contact_email ?? '—')} />
      <OrgRow label="Contact Phone" value={String(org.contact_phone ?? '—')} />
      <OrgRow label="Status" value={String(org.status ?? '—')} />
    </div>
  )
}

function OrgRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

// ─── Staff Tab ───────────────────────────────────────────────────────────────

function StaffTab({ canManage }: { canManage: boolean }) {
  const [staffList, setStaffList] = useState<InsStaffRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    settingsApi
      .listStaff({ limit: 50 })
      .then((r) => {
        const data = r as Record<string, unknown>
        setStaffList(
          (data.staff ?? data.data ?? []) as InsStaffRecord[],
        )
      })
      .catch(() => setStaffList([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {staffList.length} staff member{staffList.length !== 1 ? 's' : ''}
        </p>
        {canManage && (
          <button className="px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors">
            Add Staff
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'Role', 'Admin', 'Status', 'Last Login'].map(
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
            {staffList.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No staff members found.
                </td>
              </tr>
            ) : (
              staffList.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {s.full_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 capitalize">
                    {s.role.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.is_admin ? '✓' : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                        s.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(s.last_login_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Benefit Plans Tab ────────────────────────────────────────────────────────

function BenefitPlansTab() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
      <p className="text-sm text-gray-500">
        Benefit plan configuration is managed through the admin portal.
      </p>
    </div>
  )
}
