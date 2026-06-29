'use client'

import { useEffect, useState } from 'react'
import { LayoutShell } from '../layout-shell'
import { qualityApi } from '@/lib/api'
import { formatPct, cn } from '@/lib/utils'
import type { InsQualityMeasure } from '@/types/insurance'

export default function QualityPage() {
  const [measures, setMeasures] = useState<InsQualityMeasure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    qualityApi
      .listMeasures({ limit: 100 })
      .then((r) => {
        const data = r as Record<string, unknown>
        setMeasures((data.measures ?? data.data ?? []) as InsQualityMeasure[])
      })
      .catch(() => setMeasures([]))
      .finally(() => setLoading(false))
  }, [])

  // Group by measure_set
  const grouped = measures.reduce<Record<string, InsQualityMeasure[]>>(
    (acc, m) => {
      const key = m.measure_set ?? 'Other'
      if (!acc[key]) acc[key] = []
      acc[key].push(m)
      return acc
    },
    {},
  )

  const STARS_COLORS = ['', 'text-red-500', 'text-orange-500', 'text-amber-500', 'text-lime-600', 'text-green-600']

  return (
    <LayoutShell breadcrumb={['Quality']}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Quality Measures</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          </div>
        ) : measures.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">
            No quality measures found.
          </div>
        ) : (
          Object.entries(grouped).map(([setName, setMeasures]) => (
            <div
              key={setName}
              className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-800">{setName}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        'Code',
                        'Measure',
                        'Eligible',
                        'Numerator',
                        'Rate',
                        'Benchmark',
                        'Target',
                        'Rate vs Benchmark',
                        'Stars',
                        'Status',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {setMeasures.map((m) => {
                      const rate = m.rate ?? 0
                      const benchmark = m.benchmark_rate ?? 0
                      const pct = benchmark > 0 ? (rate / benchmark) * 100 : 0
                      const above = rate >= benchmark

                      return (
                        <tr key={m.id}>
                          <td className="px-4 py-3 font-mono text-xs text-teal-700">
                            {m.measure_code}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                            {m.measure_name}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {m.eligible_population.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {m.numerator.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-semibold text-right">
                            {formatPct(m.rate)}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-right">
                            {formatPct(m.benchmark_rate)}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-right">
                            {formatPct(m.target_rate)}
                          </td>
                          <td className="px-4 py-3 w-40">
                            {benchmark > 0 ? (
                              <div className="space-y-1">
                                <div className="h-2 rounded-full bg-gray-100">
                                  <div
                                    className={cn(
                                      'h-2 rounded-full',
                                      above ? 'bg-green-500' : 'bg-red-400',
                                    )}
                                    style={{
                                      width: `${Math.min(100, pct)}%`,
                                    }}
                                  />
                                </div>
                                <p
                                  className={cn(
                                    'text-xs font-medium',
                                    above ? 'text-green-600' : 'text-red-600',
                                  )}
                                >
                                  {above ? '+' : ''}
                                  {((rate - benchmark) * 100).toFixed(1)}pp vs
                                  benchmark
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                No benchmark
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {m.stars_rating != null ? (
                              <span
                                className={cn(
                                  'text-base font-bold',
                                  STARS_COLORS[m.stars_rating] ?? 'text-gray-600',
                                )}
                              >
                                {'★'.repeat(m.stars_rating)}
                                {'☆'.repeat(5 - m.stars_rating)}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                                m.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600',
                              )}
                            >
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </LayoutShell>
  )
}
