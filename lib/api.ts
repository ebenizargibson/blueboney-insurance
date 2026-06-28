import { INS_API_BASE } from './constants'

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'APIError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${INS_API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = body.error ?? message
    } catch {
      // ignore parse errors
    }
    throw new APIError(res.status, message)
  }

  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) => {
    const url = params
      ? `${path}?${new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)]),
          ),
        ).toString()}`
      : path
    return request<T>(url)
  },
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string, orgId: string) =>
    api.post('/auth/login', { email, password, orgId }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const dashboardApi = {
  getKPIs: () => api.get('/dashboard/kpis'),
}

// ─── Members ─────────────────────────────────────────────────────────────────

export const membersApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/members', params),
  get: (id: string) => api.get(`/members/${id}`),
  create: (body: unknown) => api.post('/members', body),
  update: (id: string, body: unknown) => api.patch(`/members/${id}`, body),
  getEligibility: (id: string, params?: Record<string, string | number | boolean | undefined>) =>
    api.get(`/members/${id}/eligibility`, params),
  checkEligibility: (id: string, body: unknown) =>
    api.post(`/members/${id}/eligibility/check`, body),
  getEnrollmentEvents: (id: string) =>
    api.get(`/members/${id}/enrollment-events`),
}

// ─── Prior Authorization ─────────────────────────────────────────────────────

export const paApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/prior-auth', params),
  get: (id: string) => api.get(`/prior-auth/${id}`),
  create: (body: unknown) => api.post('/prior-auth', body),
  decide: (id: string, body: unknown) => api.post(`/prior-auth/${id}/decide`, body),
  getEvents: (id: string) => api.get(`/prior-auth/${id}/events`),
}

// ─── Claims ──────────────────────────────────────────────────────────────────

export const claimsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/claims', params),
  get: (id: string) => api.get(`/claims/${id}`),
  create: (body: unknown) => api.post('/claims', body),
  adjudicate: (id: string, body: unknown) =>
    api.post(`/claims/${id}/adjudicate`, body),
  void: (id: string, body: unknown) => api.post(`/claims/${id}/void`, body),
  getEvents: (id: string) => api.get(`/claims/${id}/events`),
}

// ─── Providers ───────────────────────────────────────────────────────────────

export const providersApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/providers', params),
  get: (id: string) => api.get(`/providers/${id}`),
  create: (body: unknown) => api.post('/providers', body),
  update: (id: string, body: unknown) => api.patch(`/providers/${id}`, body),
  getCredentials: (id: string) => api.get(`/providers/${id}/credentials`),
  addCredential: (id: string, body: unknown) =>
    api.post(`/providers/${id}/credentials`, body),
  verifyCredential: (id: string, credId: string) =>
    api.post(`/providers/${id}/credentials/${credId}/verify`),
}

// ─── Payments ────────────────────────────────────────────────────────────────

export const paymentsApi = {
  listBatches: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/payments/batches', params),
  getBatch: (id: string) => api.get(`/payments/batches/${id}`),
  createBatch: (body: unknown) => api.post('/payments/batches', body),
  approveBatch: (id: string) => api.post(`/payments/batches/${id}/approve`),
  listPremiums: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/payments/premiums', params),
  getPremium: (id: string) => api.get(`/payments/premiums/${id}`),
  recordPayment: (id: string, body: unknown) =>
    api.post(`/payments/premiums/${id}/record`, body),
}

// ─── Care Management ─────────────────────────────────────────────────────────

export const careApi = {
  listCases: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/care/cases', params),
  getCase: (id: string) => api.get(`/care/cases/${id}`),
  createCase: (body: unknown) => api.post('/care/cases', body),
  updateCase: (id: string, body: unknown) =>
    api.patch(`/care/cases/${id}`, body),
  logActivity: (id: string, body: unknown) =>
    api.post(`/care/cases/${id}/activities`, body),
  listGaps: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/care/gaps', params),
  updateGap: (id: string, body: unknown) =>
    api.patch(`/care/gaps/${id}`, body),
  listRiskScores: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/care/risk-scores', params),
}

// ─── Fraud ───────────────────────────────────────────────────────────────────

export const fraudApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/fraud', params),
  get: (id: string) => api.get(`/fraud/${id}`),
  create: (body: unknown) => api.post('/fraud', body),
  update: (id: string, body: unknown) => api.patch(`/fraud/${id}`, body),
}

// ─── Appeals ─────────────────────────────────────────────────────────────────

export const appealsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/appeals', params),
  get: (id: string) => api.get(`/appeals/${id}`),
  create: (body: unknown) => api.post('/appeals', body),
  decide: (id: string, body: unknown) =>
    api.post(`/appeals/${id}/decide`, body),
}

// ─── Quality ─────────────────────────────────────────────────────────────────

export const qualityApi = {
  listMeasures: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/quality/measures', params),
  upsertMeasure: (body: unknown) => api.post('/quality/measures', body),
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export const reportsApi = {
  getExperience: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/reports/experience', params),
  getMembership: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/reports/membership', params),
  getFinancial: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/reports/financial', params),
}

// ─── Settings ────────────────────────────────────────────────────────────────

export const settingsApi = {
  getOrg: () => api.get('/settings/org'),
  updateOrg: (body: unknown) => api.patch('/settings/org', body),
  listStaff: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get('/settings/staff', params),
  createStaff: (body: unknown) => api.post('/settings/staff', body),
  updateStaff: (id: string, body: unknown) =>
    api.patch(`/settings/staff/${id}`, body),
}
