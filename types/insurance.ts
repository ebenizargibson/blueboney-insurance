// ─── Member ──────────────────────────────────────────────────────────────────

export interface InsMember {
  id: string
  org_id: string
  member_number: string
  subscriber_id: string | null
  relationship_to_subscriber: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string | null
  email: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string
  group_id: string | null
  plan_id: string | null
  plan_name: string | null
  enrollment_type: string
  effective_date: string | null
  termination_date: string | null
  status: string
  deductible_met: number
  oop_met: number
  lifetime_max_used: number
  risk_score: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Prior Authorization ─────────────────────────────────────────────────────

export interface InsPA {
  id: string
  org_id: string
  pa_number: string
  member_id: string
  member_name?: string
  provider_id: string | null
  provider_name?: string
  requesting_provider_npi: string | null
  requesting_provider_name: string | null
  service_type: string
  service_codes: string[]
  icd10_codes: string[]
  priority: string
  requested_units: number | null
  approved_units: number | null
  requested_start_date: string | null
  requested_end_date: string | null
  approved_start_date: string | null
  approved_end_date: string | null
  status: string
  clinical_notes: string | null
  denial_reason: string | null
  denial_code: string | null
  decided_by: string | null
  decided_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

// ─── Claim ───────────────────────────────────────────────────────────────────

export interface InsClaimLine {
  id: string
  claim_id: string
  line_number: number
  cpt_code: string | null
  revenue_code: string | null
  description: string | null
  service_date: string
  units: number
  billed_amount: number
  allowed_amount: number | null
  plan_payment: number | null
  member_responsibility: number | null
  adjustment_reason_codes: string[]
  remark_codes: string[]
  status: string
}

export interface InsClaim {
  id: string
  org_id: string
  claim_number: string
  member_id: string
  member_name?: string
  provider_id: string | null
  provider_name?: string
  facility_name: string | null
  pa_id: string | null
  claim_type: string
  bill_type: string | null
  place_of_service: string | null
  admission_date: string | null
  discharge_date: string | null
  primary_diagnosis: string | null
  diagnosis_codes: string[]
  service_from_date: string
  service_to_date: string
  total_billed: number
  total_allowed: number | null
  total_plan_payment: number | null
  total_member_responsibility: number | null
  status: string
  submission_source: string
  received_at: string
  adjudicated_at: string | null
  paid_at: string | null
  payment_batch_id: string | null
  denial_reason: string | null
  adjudicated_by: string | null
  lines?: InsClaimLine[]
  created_at: string
  updated_at: string
}

// ─── Provider ────────────────────────────────────────────────────────────────

export interface InsProvider {
  id: string
  org_id: string
  npi: string | null
  tax_id: string | null
  provider_type: string
  legal_name: string
  doing_business_as: string | null
  specialty_primary: string | null
  specialty_secondary: string | null
  network_tier: string
  contract_effective: string | null
  contract_termination: string | null
  reimbursement_method: string
  fee_schedule_id: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  address_line1: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string
  status: string
  credentialed_at: string | null
  recredential_due: string | null
  created_at: string
  updated_at: string
}

// ─── Payment Batch ───────────────────────────────────────────────────────────

export interface InsPaymentBatch {
  id: string
  org_id: string
  batch_number: string
  payment_type: string
  total_amount: number
  claim_count: number
  status: string
  payment_date: string | null
  payment_method: string | null
  reference_number: string | null
  approved_by: string | null
  approved_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// ─── Premium Invoice ─────────────────────────────────────────────────────────

export interface InsPremiumInvoice {
  id: string
  org_id: string
  invoice_number: string
  group_id: string | null
  billing_period_start: string
  billing_period_end: string
  due_date: string | null
  total_amount: number
  amount_paid: number
  status: string
  payment_received_at: string | null
  created_at: string
  updated_at: string
}

// ─── Care Case ───────────────────────────────────────────────────────────────

export interface InsCareCase {
  id: string
  org_id: string
  case_number: string
  member_id: string
  member_name?: string
  case_type: string
  priority: string
  status: string
  primary_diagnosis: string | null
  assigned_cm: string | null
  opened_at: string
  closed_at: string | null
  target_close_date: string | null
  goals: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Fraud Flag ──────────────────────────────────────────────────────────────

export interface InsFraudFlag {
  id: string
  org_id: string
  entity_type: string
  entity_id: string
  entity_name?: string
  flag_type: string
  severity: string
  description: string | null
  detection_method: string
  status: string
  assigned_to: string | null
  resolved_by: string | null
  resolved_at: string | null
  resolution_notes: string | null
  estimated_exposure: number | null
  amount_recovered: number | null
  created_at: string
  updated_at: string
}

// ─── Appeal ──────────────────────────────────────────────────────────────────

export interface InsAppeal {
  id: string
  org_id: string
  appeal_number: string
  appeal_type: string
  entity_type: string
  entity_id: string
  appealed_by: string | null
  appeal_reason: string | null
  priority: string
  status: string
  level: number
  deadline: string | null
  decided_by: string | null
  decided_at: string | null
  decision: string | null
  decision_notes: string | null
  created_at: string
  updated_at: string
}

// ─── Quality Measure ─────────────────────────────────────────────────────────

export interface InsQualityMeasure {
  id: string
  org_id: string
  measure_set: string
  measure_code: string
  measure_name: string
  measurement_year: number
  eligible_population: number
  numerator: number
  rate: number | null
  benchmark_rate: number | null
  target_rate: number | null
  stars_rating: number | null
  status: string
  last_calculated_at: string | null
  created_at: string
  updated_at: string
}

// ─── Dashboard KPIs ──────────────────────────────────────────────────────────

export interface InsDashboardKPIs {
  org_id: string
  active_members: number
  pending_claims: number
  open_pas: number
  open_fraud_flags: number
  claims_paid_30d_count: number
  claims_paid_30d_amount: number
  premiums_outstanding: number
  appeals_open: number
  high_risk_care_cases: number
  claims_received_30d: number
  claims_denied_30d: number
  denial_rate_30d: number | null
  avg_claims_processing_days: number | null
  pa_approval_rate: number | null
  fraud_recovery_ytd: number
  refreshed_at: string
}

// ─── Staff ───────────────────────────────────────────────────────────────────

export interface InsStaffRecord {
  id: string
  org_id: string
  full_name: string
  email: string
  role: string
  is_admin: boolean
  is_medical_director: boolean
  can_manage_claims: boolean
  can_manage_pa: boolean
  can_manage_members: boolean
  can_manage_payments: boolean
  can_manage_fraud: boolean
  can_manage_providers: boolean
  can_view_quality: boolean
  can_manage_care_mgmt: boolean
  status: string
  last_login_at: string | null
  created_at: string
  updated_at: string
}
