'use client'

import { useEffect, useState } from 'react'
import { authApi } from './api'

export interface InsStaff {
  staffId: string
  orgId: string
  role: string
  fullName: string
  email: string
  isAdmin: boolean
  isMedicalDirector: boolean
  canManageClaims: boolean
  canManagePA: boolean
  canManageMembers: boolean
  canManagePayments: boolean
  canManageFraud: boolean
  canManageProviders: boolean
  canViewQuality: boolean
  canManageCareMgmt: boolean
}

export function useAuth() {
  const [staff, setStaff] = useState<InsStaff | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi
      .me()
      .then((r) => {
        const data = r as Record<string, unknown>
        setStaff(
          (data.staff ?? data.data ?? null) as InsStaff | null,
        )
      })
      .catch(() => setStaff(null))
      .finally(() => setLoading(false))
  }, [])

  return { staff, loading }
}
