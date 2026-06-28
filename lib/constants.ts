export const INS_API_BASE =
  process.env.NEXT_PUBLIC_INSURANCE_API_BASE ??
  'https://blueboney.vercel.app/api/insurance'

export const CLAIM_STATUS_COLORS: Record<string, string> = {
  received: 'bg-blue-100 text-blue-800',
  pending_info: 'bg-amber-100 text-amber-800',
  under_review: 'bg-purple-100 text-purple-800',
  adjudicated: 'bg-cyan-100 text-cyan-800',
  paid: 'bg-green-100 text-green-800',
  denied: 'bg-red-100 text-red-800',
  appealed: 'bg-orange-100 text-orange-800',
  voided: 'bg-gray-100 text-gray-500',
}

export const PA_STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  pending_info: 'bg-amber-100 text-amber-800',
  under_review: 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  partially_approved: 'bg-teal-100 text-teal-800',
  denied: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
}

export const MEMBER_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  suspended: 'bg-amber-100 text-amber-800',
  terminated: 'bg-red-100 text-red-800',
  cobra: 'bg-blue-100 text-blue-800',
  pending_activation: 'bg-purple-100 text-purple-800',
}

export const FRAUD_SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-900',
}
