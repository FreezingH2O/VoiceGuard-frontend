import { request } from './http'
import type { Ward, WardAlert } from '../types'

// POC scope: only the guardian alert read path is real (Act 3 of the pitch demo).
// The remaining family functions stay on their mock implementations in api.ts.

export async function listWards(): Promise<Ward[]> {
  return request('/wards')
}

export async function listWardAlerts(wardId: string): Promise<WardAlert[]> {
  return request(`/wards/${wardId}/alerts`)
}

export async function getWardAlert(wardId: string, alertId: string): Promise<WardAlert> {
  return request(`/wards/${wardId}/alerts/${alertId}`)
}

export async function ackWardAlert(wardId: string, alertId: string): Promise<{ ok: true }> {
  return request(`/wards/${wardId}/alerts/${alertId}/ack`, { method: 'POST' })
}
