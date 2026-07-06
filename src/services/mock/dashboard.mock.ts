import { db, getCurrentUser } from './db'
import { simulateNetwork } from './delay'
import type { AlertSummary, DashboardResponse } from '../types'
import { ApiError } from '../types'

export async function getDashboard(): Promise<DashboardResponse> {
  const user = getCurrentUser()
  if (!user) throw new ApiError(401, 'unauthenticated')
  if (!user.consentRecorded) throw new ApiError(403, 'consent_required')

  const today = db.calls.filter((c) => Date.now() - new Date(c.startedAt).getTime() < 24 * 60 * 60_000)
  const recentAlerts: AlertSummary[] = db.calls
    .filter((c) => c.verdict !== 'safe')
    .slice(0, 5)
    .map((c) => ({
      alertId: `alert-${c.callId}`,
      callId: c.callId,
      level: c.verdict === 'scam' ? 'scam' : 'suspicious',
      reasonMain: c.reasons[0]?.text ?? '',
      createdAt: c.startedAt,
    }))

  return simulateNetwork({
    protectionEnabled: db.settings.protectionEnabled,
    today: {
      calls: today.length,
      alerts: today.filter((c) => c.verdict !== 'safe').length,
      highestRisk: Math.max(0, ...today.map((c) => c.riskScore)),
    },
    lastCall: db.calls[0] ?? null,
    recentAlerts,
  })
}
