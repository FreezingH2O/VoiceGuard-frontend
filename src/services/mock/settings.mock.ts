import { db } from './db'
import { simulateNetwork } from './delay'
import type { Settings, SettingsPatch } from '../types'

export async function getSettings(): Promise<Settings> {
  return simulateNetwork({ ...db.settings })
}

export async function patchSettings(patch: SettingsPatch): Promise<Settings> {
  db.settings = { ...db.settings, ...patch }
  return simulateNetwork({ ...db.settings })
}

export async function addBlocklistEntry(phone: string): Promise<Settings> {
  if (!db.settings.blocklist.includes(phone)) db.settings.blocklist.push(phone)
  db.settings.whitelist = db.settings.whitelist.filter((p) => p !== phone)
  return simulateNetwork({ ...db.settings })
}

export async function removeBlocklistEntry(phone: string): Promise<Settings> {
  db.settings.blocklist = db.settings.blocklist.filter((p) => p !== phone)
  return simulateNetwork({ ...db.settings })
}

export async function addWhitelistEntry(phone: string): Promise<Settings> {
  if (!db.settings.whitelist.includes(phone)) db.settings.whitelist.push(phone)
  db.settings.blocklist = db.settings.blocklist.filter((p) => p !== phone)
  return simulateNetwork({ ...db.settings })
}

export async function removeWhitelistEntry(phone: string): Promise<Settings> {
  db.settings.whitelist = db.settings.whitelist.filter((p) => p !== phone)
  return simulateNetwork({ ...db.settings })
}

export async function patchNotificationPrefs(
  prefs: Partial<Settings['notificationPrefs']>,
): Promise<{ ok: true }> {
  db.settings.notificationPrefs = { ...db.settings.notificationPrefs, ...prefs }
  return simulateNetwork({ ok: true })
}

export async function deleteAccount(): Promise<{ ok: true }> {
  db.currentUserId = null
  return simulateNetwork({ ok: true })
}

export async function registerDevice(_payload: { platform: 'web'; pushToken: string }): Promise<{ ok: true }> {
  return simulateNetwork({ ok: true })
}

export async function recordConsent(_payload: { policyVersion: string; accepted: true }): Promise<{ ok: true }> {
  const user = db.users.find((u) => u.id === db.currentUserId)
  if (user) user.consentRecorded = true
  return simulateNetwork({ ok: true })
}
