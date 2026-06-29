'use client'

import { useEffect, useState } from 'react'
import { LayoutShell } from '../layout-shell'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { paymentsApi } from '@/lib/api'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import type { InsPaymentBatch, InsPremiumInvoice } from '@/types/insurance'

const BATCH_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  voided: 'bg-gray-100 text-gray-500',
}

const PREMIUM_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  issued: 'bg-blue-100 text-blue-800',
  partial: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

const TABS = ['Payment Batches', 'Premium Invoices']

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('Payment Batches')
  const [batches, setBatches] = useState<InsPaymentBatch[]>([])
  const [premiums, setPremiums] = useState<InsPremiumInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (activeTab === 'Payment Batches') {
      paymentsApi
        .listBatches({ limit: 50 })
        .then((r) => {
          const data = r as Record<string, unknown>
          setBatches((data.batches ?? data.data ?? []) as InsPaymentBatch[])
        })
        .catch(() => setBatches([]))
        .finally(() => setLoading(false))
    } else {
      paymentsApi
        .listPremiums({ limit: 50 })
        .then((r) => {
          const data = r as Record<string, unknown>
          setPremiums((data.invoices ?? data.data ?? []) as InsPremiumInvoice[])
        })
        .catch(() => setPremiums([]))
        .finally(() => setLoading(false))
    }
  }, [activeTab])

  const batchColumns: Column<Record<string, unknown>>[] = [
    {
      key: 'batch_number',
      header: 'Batch #',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-teal-700">
          {String(row.batch_number ?? '—')}
        </span>
      ),
    },
    {
      key: 'payment_type',
      header: 'Type',
      render: (row) => (
        <span className="capitalize">
          {String(row.payment_type ?? '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      render: (row) => formatCurrency(row.total_amount as number | null),
    },
    {
      key: 'claim_count',
      header: 'Claims',
      render: (row) => String(row.claim_count ?? 0),
    },
    {
      key: 'payment_date',
      header: 'Payment Date',
      render: (row) => formatDate(row.payment_date as string | null),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge
          label={String(row.status ?? '')}
          className={
            BATCH_STATUS_COLORS[String(row.status)] ??
            'bg-gray-100 text-gray-600'
          }
        />
      ),
    },
  ]

  const premiumColumns: Column<Record<string, unknown>>[] = [
    {
      key: 'invoice_number',
      header: 'Invoice #',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-teal-700">
          {String(row.invoice_number ?? '—')}
        </span>
      ),
    },
    {
      key: 'group_id',
      header: 'Group',
      render: (row) => String(row.group_id ?? '—'),
    },
    {
      key: 'billing_period',
      header: 'Billing Period',
      render: (row) =>
        `${formatDate(row.billing_period_start as string)} — ${formatDate(row.billing_period_end as string)}`,
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (row) => formatCurrency(row.total_amount as number | null),
    },
    {
      key: 'amount_paid',
      header: 'Paid',
      render: (row) => formatCurrency(row.amount_paid as number | null),
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
            PREMIUM_STATUS_COLORS[String(row.status)] ??
            'bg-gray-100 text-gray-600'
          }
        />
      ),
    },
  ]

  return (
    <LayoutShell breadcrumb={['Payments']}>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

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

        {activeTab === 'Payment Batches' && (
          <DataTable
            columns={batchColumns}
            rows={batches as unknown as Record<string, unknown>[]}
            loading={loading}
            emptyMessage="No payment batches found."
          />
        )}
        {activeTab === 'Premium Invoices' && (
          <DataTable
            columns={premiumColumns}
            rows={premiums as unknown as Record<string, unknown>[]}
            loading={loading}
            emptyMessage="No premium invoices found."
          />
        )}
      </div>
    </LayoutShell>
  )
}
