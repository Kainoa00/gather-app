import type {
  PCCAuthConfig,
  PCCListResponse,
  PCCResident,
  PCCVitals,
  PCCMedicationOrder,
  PCCMedicationAdministration,
  PCCProgressNote,
  PCCIncident,
  PCCAssessment,
  PCCAppointment,
} from './types'
import {
  PCCError,
  PCCAuthError,
  PCCNotFoundError,
  PCCRateLimitError,
  PCCConnectionError,
  PCCValidationError,
} from './errors'

export class PCCClient {
  private readonly baseUrl: string
  private readonly config: PCCAuthConfig
  private accessToken: string | null = null
  private tokenExpiresAt: Date | null = null

  constructor(config: PCCAuthConfig) {
    const envUrl = process.env.PCC_API_URL ?? process.env.NEXT_PUBLIC_PCC_API_URL
    let raw: string
    if (envUrl) {
      raw = envUrl
    } else if (process.env.NEXT_PUBLIC_SITE_URL) {
      raw = `${process.env.NEXT_PUBLIC_SITE_URL}/api/mock-pcc`
    } else if (typeof window !== 'undefined') {
      // Browser: use the current origin so relative calls work in preview deployments
      raw = `${window.location.origin}/api/mock-pcc`
    } else {
      // Server-side fallback
      raw = 'http://localhost:3000/api/mock-pcc'
    }
    this.baseUrl = raw.replace(/\/$/, '')
    this.config = config
  }

  private async getAccessToken(): Promise<string> {
    const now = new Date()
    if (
      this.accessToken &&
      this.tokenExpiresAt &&
      this.tokenExpiresAt.getTime() - now.getTime() > 60_000
    ) {
      return this.accessToken
    }

    let res: Response
    try {
      res = await fetch(`${this.baseUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret,
          facilityId: this.config.facilityId,
        }),
      })
    } catch (err) {
      throw new PCCConnectionError(
        `Auth token request failed: ${(err as Error).message}`,
        undefined,
        this.config.facilityId
      )
    }

    if (!res.ok) {
      throw new PCCAuthError(
        `Failed to obtain access token (HTTP ${res.status})`,
        res.status,
        this.config.facilityId
      )
    }

    const body = (await res.json()) as { access_token: string; expires_in: number }
    this.accessToken = body.access_token
    this.tokenExpiresAt = new Date(now.getTime() + body.expires_in * 1_000)
    return this.accessToken
  }

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this._requestWithRetry<T>(path, params, false)
  }

  private async _requestWithRetry<T>(
    path: string,
    params: Record<string, string> | undefined,
    isRetry: boolean
  ): Promise<T> {
    const token = await this.getAccessToken()

    const url = new URL(`${this.baseUrl}${path}`)
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v)
      }
    }

    let res: Response
    try {
      res = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    } catch (err) {
      throw new PCCConnectionError(
        `Network request failed: ${(err as Error).message}`,
        undefined,
        this.config.facilityId
      )
    }

    if (res.status === 401) {
      // Token was accepted by getAccessToken but rejected by the resource server.
      // Clear and retry once in case we cached a token that was revoked server-side.
      if (!isRetry) {
        this.accessToken = null
        this.tokenExpiresAt = null
        return this._requestWithRetry<T>(path, params, true)
      }
      throw new PCCAuthError('Unauthorized', 401, this.config.facilityId)
    }

    if (res.status === 403) {
      throw new PCCAuthError('Forbidden', 403, this.config.facilityId)
    }

    if (res.status === 404) {
      throw new PCCNotFoundError(`Not found: ${path}`, 404, this.config.facilityId)
    }

    if (res.status === 429) {
      throw new PCCRateLimitError('Rate limit exceeded', 429, this.config.facilityId)
    }

    if (res.status === 400) {
      const text = await res.text()
      throw new PCCValidationError(
        `Bad request: ${text}`,
        400,
        this.config.facilityId
      )
    }

    if (!res.ok) {
      throw new PCCError(
        `PCC API error (HTTP ${res.status})`,
        res.status,
        this.config.facilityId
      )
    }

    return res.json() as Promise<T>
  }

  private async fetchAllPages<T>(
    path: string,
    params?: Record<string, string>
  ): Promise<T[]> {
    const results: T[] = []
    let page = 1

    while (true) {
      const pageParams: Record<string, string> = {
        ...params,
        page: String(page),
        pageSize: '100',
      }
      const response = await this.request<PCCListResponse<T>>(path, pageParams)
      results.push(...response.data)
      if (!response.pagination.hasMore) break
      page++
    }

    return results
  }

  async listResidents(): Promise<PCCResident[]> {
    return this.fetchAllPages<PCCResident>(`/residents`)
  }

  async getResident(residentId: string): Promise<PCCResident> {
    return this.request<PCCResident>(`/residents/${residentId}`)
  }

  async getVitals(
    residentId: string,
    startDate: string,
    endDate: string
  ): Promise<PCCVitals[]> {
    return this.fetchAllPages<PCCVitals>(
      `/residents/${residentId}/vitals`,
      { startDate, endDate }
    )
  }

  async getMedicationOrders(residentId: string): Promise<PCCMedicationOrder[]> {
    return this.fetchAllPages<PCCMedicationOrder>(
      `/residents/${residentId}/medications/orders`
    )
  }

  async getMedicationAdministrations(
    residentId: string,
    startDate: string,
    endDate: string
  ): Promise<PCCMedicationAdministration[]> {
    return this.fetchAllPages<PCCMedicationAdministration>(
      `/residents/${residentId}/medications/administrations`,
      { startDate, endDate }
    )
  }

  async getProgressNotes(
    residentId: string,
    startDate: string,
    endDate: string
  ): Promise<PCCProgressNote[]> {
    return this.fetchAllPages<PCCProgressNote>(
      `/residents/${residentId}/notes`,
      { startDate, endDate }
    )
  }

  async getIncidents(
    residentId: string,
    startDate: string,
    endDate: string
  ): Promise<PCCIncident[]> {
    return this.fetchAllPages<PCCIncident>(
      `/residents/${residentId}/incidents`,
      { startDate, endDate }
    )
  }

  async getAssessments(
    residentId: string,
    startDate: string,
    endDate: string
  ): Promise<PCCAssessment[]> {
    return this.fetchAllPages<PCCAssessment>(
      `/residents/${residentId}/assessments`,
      { startDate, endDate }
    )
  }

  async getAppointments(
    residentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<PCCAppointment[]> {
    const params: Record<string, string> = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return this.fetchAllPages<PCCAppointment>(
      `/residents/${residentId}/appointments`,
      params
    )
  }
}

export function createPCCClient(facilityId: string): PCCClient {
  const clientId =
    process.env[`PCC_CLIENT_ID_${facilityId}`] ?? process.env.PCC_CLIENT_ID ?? ''
  const clientSecret =
    process.env[`PCC_CLIENT_SECRET_${facilityId}`] ??
    process.env.PCC_CLIENT_SECRET ??
    ''
  return new PCCClient({
    facilityId,
    clientId,
    clientSecret,
    accessToken: null,
    tokenExpiresAt: null,
  })
}

let _mockClient: PCCClient | null = null
export function getMockPCCClient(): PCCClient {
  if (!_mockClient) {
    _mockClient = new PCCClient({
      facilityId: 'pcc-f-001',
      clientId: 'mock-client-id',
      clientSecret: 'mock-client-secret',
      accessToken: null,
      tokenExpiresAt: null,
    })
  }
  return _mockClient
}
