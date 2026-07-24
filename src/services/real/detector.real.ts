import { request } from './http'
import type { DetectorTestRecord, LiveTestResponse } from '../types'

// The backend auto-saves each authenticated live-test result (see the live-test
// endpoint), so there's nothing to POST here — recordTest is a no-op and the
// screen just re-fetches listTests. The history reads/deletes are real.

export async function listDetectorTests(): Promise<DetectorTestRecord[]> {
  return request('/me/detector-tests')
}

export function recordDetectorTest(_result: LiveTestResponse): void {
  // No-op: the result was already persisted server-side during /demo/live-test.
}

export async function deleteDetectorTest(id: string): Promise<{ ok: true }> {
  return request(`/me/detector-tests/${id}`, { method: 'DELETE' })
}
