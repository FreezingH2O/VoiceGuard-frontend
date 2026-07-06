import { db, getCurrentUser } from './db'
import { simulateNetwork } from './delay'
import type { Guardian, GuardianInviteResponse, User, Ward, WardAlert } from '../types'
import { ApiError } from '../types'

export async function getMe(): Promise<User> {
  const user = getCurrentUser()
  if (!user) throw new ApiError(401, 'unauthenticated')
  return simulateNetwork(user)
}

export async function patchMe(patch: Partial<Pick<User, 'name' | 'phone' | 'email'>>): Promise<User> {
  const user = getCurrentUser()
  if (!user) throw new ApiError(401, 'unauthenticated')
  Object.assign(user, patch)
  return simulateNetwork({ ...user })
}

/** Dev-only helper (Profile screen role switcher) — not a real spec endpoint. */
export function switchRole(role: 'elder' | 'guardian'): User | null {
  const target = db.users.find((u) => u.role === role)
  if (target) db.currentUserId = target.id
  return target ?? null
}

export async function listGuardians(): Promise<Guardian[]> {
  return simulateNetwork([...db.guardians])
}

export async function inviteGuardian(): Promise<GuardianInviteResponse> {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase()
  return simulateNetwork({
    code,
    qrDataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="white"/><rect x="10" y="10" width="140" height="140" fill="none" stroke="black" stroke-width="4"/><text x="80" y="85" font-size="16" text-anchor="middle" font-family="monospace">${code}</text></svg>`,
      ),
  })
}

export async function patchGuardianVisibility(guardianId: string, canSee: boolean): Promise<Guardian> {
  const guardian = db.guardians.find((g) => g.id === guardianId)
  if (!guardian) throw new Error(`Guardian ${guardianId} not found`)
  guardian.canSee = canSee
  return simulateNetwork({ ...guardian })
}

export async function removeGuardian(guardianId: string): Promise<{ ok: true }> {
  db.guardians = db.guardians.filter((g) => g.id !== guardianId)
  return simulateNetwork({ ok: true })
}

export async function listWards(): Promise<Ward[]> {
  return simulateNetwork([...db.wards])
}

export async function listWardAlerts(wardId: string): Promise<WardAlert[]> {
  return simulateNetwork([...(db.wardAlerts[wardId] ?? [])])
}

export async function getWardAlert(wardId: string, alertId: string): Promise<WardAlert> {
  const alert = (db.wardAlerts[wardId] ?? []).find((a) => a.alertId === alertId)
  if (!alert) throw new Error(`Alert ${alertId} not found`)
  return simulateNetwork({ ...alert })
}

export async function notifyWardContact(_wardId: string, _alertId: string): Promise<{ ok: true }> {
  return simulateNetwork({ ok: true })
}

export async function blockWardNumber(
  wardId: string,
  _phone: string,
): Promise<{ ok: true } | { error: 'forbidden' }> {
  const alerts = db.wardAlerts[wardId] ?? []
  const disallowed = alerts.some((a) => !a.blockAllowed)
  if (disallowed) return simulateNetwork({ error: 'forbidden' as const })
  return simulateNetwork({ ok: true as const })
}

export async function ackWardAlert(wardId: string, alertId: string): Promise<{ ok: true }> {
  const alert = (db.wardAlerts[wardId] ?? []).find((a) => a.alertId === alertId)
  if (alert) alert.acked = true
  return simulateNetwork({ ok: true })
}
