import type { AlertLevel, Role, Sensitivity, Verdict } from '@/types/domain'
import type { RealtimeInbound } from '@/ws/types'

export type { AlertLevel, Role, Sensitivity, Verdict }

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

// ---- Auth ----
export interface SignupPayload {
  name: string
  phone: string
  email: string
}
export interface LoginPayload {
  phone?: string
  email?: string
}
export interface User {
  id: string
  name: string
  phone: string
  email: string
  role: Role
  consentRecorded: boolean
}
export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

// ---- Devices / consent / settings ----
export interface RegisterDevicePayload {
  platform: 'web'
  pushToken: string
}
export interface ConsentPayload {
  policyVersion: string
  accepted: true
}
export interface Settings {
  protectionEnabled: boolean
  sensitivity: Sensitivity
  alertStyles: ('banner' | 'sound' | 'vibrate')[]
  alertScope: 'all-calls' | 'unknown-only'
  asrLanguage: string
  dataRetentionDays: number
  storeTranscripts: boolean
  blocklist: string[]
  whitelist: string[]
  notificationPrefs: { push: boolean; email: boolean; sms: boolean }
}
export type SettingsPatch = Partial<Omit<Settings, 'blocklist' | 'whitelist' | 'notificationPrefs'>>

// ---- Dashboard ----
export interface CallSummary {
  callId: string
  callerNumber: string
  startedAt: string
  durationSec: number
  verdict: Verdict
  spoofScore: number
  riskScore: number
}
export interface AlertSummary {
  alertId: string
  callId: string
  level: AlertLevel
  reasonMain: string
  createdAt: string
}
export interface DashboardResponse {
  protectionEnabled: boolean
  today: { calls: number; alerts: number; highestRisk: number }
  lastCall: CallSummary | null
  recentAlerts: AlertSummary[]
}

// ---- Calls (real + history + detail) ----
export interface StartCallPayload {
  callerNumber: string
  direction: 'inbound' | 'outbound'
}
export type StartCallResponse =
  | { monitoring: true; callId: string; wsUrl: string; wsToken: string }
  | { monitoring: false; reason: 'protection_disabled' | 'unsupported' }
export interface CallListQuery {
  verdict?: Verdict
  from?: string
  to?: string
  q?: string
  page?: number
  limit?: number
}
export interface CallListResponse {
  items: CallSummary[]
  nextPage: number | null
  total: number
}
export interface CallDetail extends CallSummary {
  transcriptSummary: string
  reasons: { text: string; tone: 'neutral' | 'warn' | 'danger' }[]
}
export interface CallTimelineResponse {
  points: { t: number; spoof: number; scam: number }[]
  threshold: number
}
export interface ReportPayload {
  category: string
  comment?: string
}
export interface SharePayload {
  guardianId: string
}
export interface FeedbackPayload {
  verdictCorrect: boolean
  note?: string
}

// ---- Family ----
export interface Guardian {
  id: string
  name: string
  phone: string
  canSee: boolean
}
export interface GuardianInviteResponse {
  code: string
  qrDataUrl: string
}
export interface Ward {
  id: string
  name: string
  phone: string
  lastActivity: string
}
export interface WardAlert {
  alertId: string
  wardId: string
  level: AlertLevel
  elderName: string
  elderPhone: string
  callOngoing: boolean
  whatsHappening: string
  createdAt: string
  acked: boolean
  blockAllowed: boolean
}

// ---- Demo ----
export interface DemoScenarioListItem {
  id: string
  title: string
  tag: string
  description: string
  icon: string
}
export interface DemoScenarioDetail {
  id: string
  audioUrl: string
  events: { t: number; event: RealtimeInbound }[]
}
export interface DemoScenarioDebrief {
  verdict: Verdict
  caption: string
  stages: { title: string; description: string }[]
}
export interface LiveTestResponse {
  spoofProb: number
  transcript: string
  summary: string
  intents: string[]
  scamProb: number
  reasons: string[]
  latencyMs: number
}
