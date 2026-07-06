import type {
  CallDetail,
  Guardian,
  Settings,
  User,
  Ward,
  WardAlert,
} from '../types'

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

export const defaultSettings: Settings = {
  protectionEnabled: true,
  sensitivity: 'balanced',
  alertStyles: ['banner', 'sound'],
  alertScope: 'all-calls',
  asrLanguage: 'en-US',
  dataRetentionDays: 90,
  storeTranscripts: true,
  blocklist: [],
  whitelist: [],
  notificationPrefs: { push: true, email: false, sms: true },
}

function seedUsers(): User[] {
  return [
    {
      id: 'u-elder',
      name: 'Somsak Rattanakosin',
      phone: '+66 82 555 0147',
      email: 'somsak@example.com',
      role: 'elder',
      consentRecorded: false,
    },
    {
      id: 'u-guardian',
      name: 'Nok Rattanakosin',
      phone: '+66 81 222 9981',
      email: 'nok@example.com',
      role: 'guardian',
      consentRecorded: false,
    },
  ]
}

function seedCalls(): CallDetail[] {
  return [
    {
      callId: 'call-1',
      callerNumber: '+66 2 100 4455',
      startedAt: isoMinutesAgo(45),
      durationSec: 187,
      verdict: 'scam',
      spoofScore: 91,
      riskScore: 88,
      transcriptSummary:
        'Caller claimed to be from "Bangkok Bank Security" and asked for an OTP to "verify a suspicious transaction."',
      reasons: [
        { text: 'Voice print does not match a known-genuine sample', tone: 'danger' },
        { text: 'Caller requested a one-time passcode', tone: 'danger' },
        { text: 'High urgency / pressure language detected', tone: 'warn' },
        { text: 'Caller ID does not match claimed institution', tone: 'warn' },
      ],
    },
    {
      callId: 'call-2',
      callerNumber: '+66 89 444 1122',
      startedAt: isoMinutesAgo(240),
      durationSec: 96,
      verdict: 'suspicious',
      spoofScore: 62,
      riskScore: 58,
      transcriptSummary: 'Caller claimed to be a police officer investigating a parcel with illegal contents.',
      reasons: [
        { text: 'Elevated vocal-synthesis artifacts detected', tone: 'warn' },
        { text: 'Caller impersonated a government authority', tone: 'warn' },
        { text: 'No direct financial request made yet', tone: 'neutral' },
      ],
    },
    {
      callId: 'call-3',
      callerNumber: '+66 61 777 3300',
      startedAt: isoMinutesAgo(1400),
      durationSec: 312,
      verdict: 'safe',
      spoofScore: 6,
      riskScore: 4,
      transcriptSummary: 'Family member confirming weekend plans.',
      reasons: [
        { text: 'Voice print matches a known-genuine sample', tone: 'neutral' },
        { text: 'No urgency, financial, or authority language detected', tone: 'neutral' },
      ],
    },
    {
      callId: 'call-4',
      callerNumber: '+66 92 010 8834',
      startedAt: isoMinutesAgo(2880),
      durationSec: 154,
      verdict: 'safe',
      spoofScore: 11,
      riskScore: 9,
      transcriptSummary: 'Pharmacy confirming a prescription pickup time.',
      reasons: [{ text: 'Caller ID matches a known, whitelisted business', tone: 'neutral' }],
    },
    {
      callId: 'call-5',
      callerNumber: '+66 88 900 2211',
      startedAt: isoMinutesAgo(4200),
      durationSec: 203,
      verdict: 'scam',
      spoofScore: 95,
      riskScore: 93,
      transcriptSummary: 'AI-cloned voice claiming to be a grandchild in urgent need of emergency bail money.',
      reasons: [
        { text: 'Voice cloning artifacts strongly detected', tone: 'danger' },
        { text: 'Emergency-money request from an unverified relative claim', tone: 'danger' },
        { text: 'Caller discouraged contacting other family members', tone: 'danger' },
      ],
    },
  ]
}

function seedGuardians(): Guardian[] {
  return [
    { id: 'g-1', name: 'Nok Rattanakosin', phone: '+66 81 222 9981', canSee: true },
    { id: 'g-2', name: 'Preecha Rattanakosin', phone: '+66 86 333 4471', canSee: false },
  ]
}

function seedWards(): Ward[] {
  return [{ id: 'w-1', name: 'Somsak Rattanakosin', phone: '+66 82 555 0147', lastActivity: isoMinutesAgo(45) }]
}

function seedWardAlerts(): Record<string, WardAlert[]> {
  return {
    'w-1': [
      {
        alertId: 'wa-1',
        wardId: 'w-1',
        level: 'scam',
        elderName: 'Somsak Rattanakosin',
        elderPhone: '+66 82 555 0147',
        callOngoing: false,
        whatsHappening:
          'A caller claiming to be from "Bangkok Bank Security" asked Somsak to read out a one-time passcode. VoiceGuard detected a high-confidence cloned voice and flagged the call as a likely scam.',
        createdAt: isoMinutesAgo(45),
        acked: false,
        blockAllowed: true,
      },
      {
        alertId: 'wa-2',
        wardId: 'w-1',
        level: 'suspicious',
        elderName: 'Somsak Rattanakosin',
        elderPhone: '+66 82 555 0147',
        callOngoing: false,
        whatsHappening:
          'A caller impersonating a police officer mentioned a suspicious parcel. No financial request was made before the call ended.',
        createdAt: isoMinutesAgo(240),
        acked: true,
        blockAllowed: false,
      },
    ],
  }
}

export const db = {
  users: seedUsers(),
  currentUserId: null as string | null,
  settings: { ...defaultSettings },
  calls: seedCalls(),
  guardians: seedGuardians(),
  wards: seedWards(),
  wardAlerts: seedWardAlerts(),
  liveTestCallCount: 0,
}

export function getCurrentUser(): User | null {
  return db.users.find((u) => u.id === db.currentUserId) ?? null
}
