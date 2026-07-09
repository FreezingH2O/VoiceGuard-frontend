import type { TimedEvent } from '@/ws/types'
import type { DemoScenarioDebrief, DemoScenarioDetail, DemoScenarioListItem } from '../types'

interface ScenarioDefinition {
  list: DemoScenarioListItem
  events: TimedEvent[]
  debrief: DemoScenarioDebrief
}

const bankOfficer: ScenarioDefinition = {
  list: {
    id: 'bank-officer',
    title: 'Fake bank security officer',
    tag: 'Classic',
    description: 'A caller claims your account is compromised and asks you to confirm your OTP.',
    icon: 'bank',
  },
  events: [
    { t: 0, event: { type: 'state', value: 'monitoring' } },
    { t: 1500, event: { type: 'transcript', seq: 0, speaker: 'caller', text: "Hello, this is calling from Bangkok Bank's security department." } },
    { t: 2200, event: { type: 'spoof_score', seq: 1, score: 58 } },
    { t: 4500, event: { type: 'transcript', seq: 2, speaker: 'caller', text: "We've detected unusual activity on your account and need to verify your identity." } },
    { t: 5200, event: { type: 'spoof_score', seq: 3, score: 74 } },
    { t: 5500, event: { type: 'risk_score', score: 55, threshold: 70 } },
    { t: 7500, event: { type: 'context_update', summary: 'Caller claims to be from your bank and is building urgency.', intents: ['impersonation', 'urgency'] } },
    { t: 9500, event: { type: 'transcript', seq: 4, speaker: 'caller', text: 'Please read out the one-time code we just texted to your phone.' } },
    { t: 10200, event: { type: 'spoof_score', seq: 5, score: 89 } },
    { t: 10500, event: { type: 'risk_score', score: 91, threshold: 70 } },
    { t: 10800, event: { type: 'context_update', summary: 'Caller is now directly requesting your one-time passcode (OTP).', intents: ['impersonation', 'urgency', 'asks for OTP'] } },
    { t: 11200, event: { type: 'state', value: 'suspicious' } },
    {
      t: 12500,
      event: {
        type: 'alert',
        level: 'scam',
        reasonMain: 'This voice is likely fake. Caller is asking for your bank OTP.',
        reasons: [
          'Voice print does not match a known-genuine sample',
          'Caller requested a one-time passcode',
          'High urgency / pressure language detected',
        ],
        guardiansNotified: true,
      },
    },
    { t: 12700, event: { type: 'state', value: 'alerted' } },
  ],
  debrief: {
    verdict: 'scam',
    caption: 'PaTuean flagged this call as a likely scam in 12.5 seconds.',
    stages: [
      { title: 'Voice analysis', description: 'The caller\'s voice showed cloning artifacts inconsistent with a real bank officer.' },
      { title: 'Language patterns', description: 'Urgency and authority-impersonation language triggered the context model.' },
      { title: 'The ask', description: 'A request for a one-time passcode is a hallmark of an account-takeover scam.' },
      { title: 'Response', description: 'An alert was shown immediately and your guardian was notified in real time.' },
    ],
  },
}

const policeOfficer: ScenarioDefinition = {
  list: {
    id: 'police-officer',
    title: 'Fake police officer',
    tag: 'Aggressive',
    description: 'A caller impersonates law enforcement about an illegal parcel in your name.',
    icon: 'authority',
  },
  events: [
    { t: 0, event: { type: 'state', value: 'monitoring' } },
    { t: 1500, event: { type: 'transcript', seq: 0, speaker: 'caller', text: 'This is Officer Somchai from the Customs Investigation Unit.' } },
    { t: 2200, event: { type: 'spoof_score', seq: 1, score: 49 } },
    { t: 4500, event: { type: 'transcript', seq: 2, speaker: 'caller', text: 'We intercepted a parcel with illegal substances registered under your name.' } },
    { t: 5200, event: { type: 'spoof_score', seq: 3, score: 68 } },
    { t: 5500, event: { type: 'risk_score', score: 52, threshold: 70 } },
    { t: 7500, event: { type: 'context_update', summary: 'Caller is impersonating a law-enforcement authority.', intents: ['impersonation', 'authority'] } },
    { t: 9500, event: { type: 'transcript', seq: 4, speaker: 'caller', text: 'You must stay on the line and pay a clearance fee to avoid arrest.' } },
    { t: 10200, event: { type: 'spoof_score', seq: 5, score: 81 } },
    { t: 10500, event: { type: 'risk_score', score: 85, threshold: 70 } },
    { t: 10800, event: { type: 'context_update', summary: 'Caller is demanding an immediate payment to avoid arrest.', intents: ['impersonation', 'urgency', 'payment demand'] } },
    { t: 11200, event: { type: 'state', value: 'suspicious' } },
    {
      t: 12500,
      event: {
        type: 'alert',
        level: 'scam',
        reasonMain: 'This voice is likely fake. Caller is threatening arrest to demand payment.',
        reasons: [
          'Voice cloning artifacts detected',
          'Caller impersonated a government authority',
          'Payment demanded under threat of arrest',
        ],
        guardiansNotified: true,
      },
    },
    { t: 12700, event: { type: 'state', value: 'alerted' } },
  ],
  debrief: {
    verdict: 'scam',
    caption: 'PaTuean flagged this call as a likely scam in 12.5 seconds.',
    stages: [
      { title: 'Voice analysis', description: 'Vocal-synthesis artifacts were detected partway through the call.' },
      { title: 'Language patterns', description: 'Authority impersonation and legal threats triggered the context model.' },
      { title: 'The ask', description: 'A demand for payment to avoid arrest is a classic law-enforcement impersonation scam.' },
      { title: 'Response', description: 'An alert was shown immediately and your guardian was notified in real time.' },
    ],
  },
}

const grandchild: ScenarioDefinition = {
  list: {
    id: 'grandchild-emergency',
    title: 'Cloned grandchild emergency',
    tag: 'Voice clone',
    description: 'A cloned voice pretending to be a grandchild begs for emergency money.',
    icon: 'family',
  },
  events: [
    { t: 0, event: { type: 'state', value: 'monitoring' } },
    { t: 1500, event: { type: 'transcript', seq: 0, speaker: 'caller', text: 'Grandma, it\'s me — I\'m in trouble, please don\'t hang up.' } },
    { t: 2200, event: { type: 'spoof_score', seq: 1, score: 72 } },
    { t: 4500, event: { type: 'transcript', seq: 2, speaker: 'caller', text: "I got in an accident and I need bail money right now, please don't tell mom and dad." } },
    { t: 5200, event: { type: 'spoof_score', seq: 3, score: 90 } },
    { t: 5500, event: { type: 'risk_score', score: 80, threshold: 70 } },
    { t: 7500, event: { type: 'context_update', summary: 'Caller claims to be a family member in an emergency and discourages contacting others.', intents: ['family impersonation', 'urgency', 'isolation'] } },
    { t: 9500, event: { type: 'transcript', seq: 4, speaker: 'caller', text: 'Can you send money through the link I\'m about to text you? Please hurry.' } },
    { t: 10200, event: { type: 'spoof_score', seq: 5, score: 95 } },
    { t: 10500, event: { type: 'risk_score', score: 93, threshold: 70 } },
    { t: 10800, event: { type: 'context_update', summary: 'Caller is requesting an urgent money transfer.', intents: ['family impersonation', 'urgency', 'money transfer'] } },
    { t: 11200, event: { type: 'state', value: 'suspicious' } },
    {
      t: 12500,
      event: {
        type: 'alert',
        level: 'scam',
        reasonMain: 'A cloned family voice begs for emergency money.',
        reasons: [
          'Voice cloning artifacts strongly detected',
          'Emergency-money request from an unverified relative claim',
          'Caller discouraged contacting other family members',
        ],
        guardiansNotified: true,
      },
    },
    { t: 12700, event: { type: 'state', value: 'alerted' } },
  ],
  debrief: {
    verdict: 'scam',
    caption: 'PaTuean flagged this call as a likely scam in 12.5 seconds.',
    stages: [
      { title: 'Voice analysis', description: 'The voice was a strong match for an AI clone, not the real grandchild.' },
      { title: 'Language patterns', description: 'Emotional urgency plus isolation language ("don\'t tell mom and dad") triggered the model.' },
      { title: 'The ask', description: 'An unverified urgent money transfer request is a hallmark of a family-emergency scam.' },
      { title: 'Response', description: 'An alert was shown immediately and your guardian was notified in real time.' },
    ],
  },
}

const legitimate: ScenarioDefinition = {
  list: {
    id: 'legitimate-call',
    title: 'A real, everyday call',
    tag: 'Control',
    description: 'See how PaTuean stays quiet during an ordinary, safe conversation.',
    icon: 'safe',
  },
  events: [
    { t: 0, event: { type: 'state', value: 'monitoring' } },
    { t: 1500, event: { type: 'transcript', seq: 0, speaker: 'caller', text: 'Hey, it\'s me, just calling to check in.' } },
    { t: 2200, event: { type: 'spoof_score', seq: 1, score: 6 } },
    { t: 4500, event: { type: 'transcript', seq: 2, speaker: 'caller', text: 'Are we still on for dinner on Saturday?' } },
    { t: 5200, event: { type: 'spoof_score', seq: 3, score: 8 } },
    { t: 5500, event: { type: 'risk_score', score: 4, threshold: 70 } },
    { t: 7500, event: { type: 'context_update', summary: 'Casual personal call, no financial or urgent requests detected.', intents: ['personal', 'low risk'] } },
    { t: 9500, event: { type: 'transcript', seq: 4, speaker: 'caller', text: 'Great, I\'ll see you then. Talk soon!' } },
    { t: 10200, event: { type: 'spoof_score', seq: 5, score: 5 } },
    { t: 10500, event: { type: 'risk_score', score: 3, threshold: 70 } },
  ],
  debrief: {
    verdict: 'safe',
    caption: 'PaTuean stayed quiet — nothing suspicious was detected.',
    stages: [
      { title: 'Voice analysis', description: 'The voice print was consistent with a real, unmodified human voice throughout.' },
      { title: 'Language patterns', description: 'No urgency, authority, or financial-request language was detected.' },
      { title: 'The ask', description: 'No money, codes, or personal information were requested.' },
      { title: 'Response', description: 'No alert was needed — the call was allowed to proceed normally.' },
    ],
  },
}

const scenarios: Record<string, ScenarioDefinition> = {
  [bankOfficer.list.id]: bankOfficer,
  [policeOfficer.list.id]: policeOfficer,
  [grandchild.list.id]: grandchild,
  [legitimate.list.id]: legitimate,
}

export function listScenarios(): DemoScenarioListItem[] {
  return Object.values(scenarios).map((s) => s.list)
}

export function getScenarioDetail(id: string): DemoScenarioDetail | null {
  const s = scenarios[id]
  if (!s) return null
  return { id, audioUrl: `mock://scenario/${id}.mp3`, events: s.events }
}

export function getScenarioDebrief(id: string): DemoScenarioDebrief | null {
  return scenarios[id]?.debrief ?? null
}

export function getScenarioCallerName(id: string): { name: string; icon: string } {
  const s = scenarios[id]
  return s ? { name: s.list.title, icon: s.list.icon } : { name: 'Unknown caller', icon: 'phone' }
}
