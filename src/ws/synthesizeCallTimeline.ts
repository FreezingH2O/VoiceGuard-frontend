import type { TimedEvent } from './types'

/**
 * Builds a deterministic (seeded by callId) event timeline for /call/:callId, since there
 * is no real backend yet. Deterministic so revisiting the same callId replays the same
 * "call" instead of a different random one each time.
 */
export function synthesizeCallTimeline(callId: string): TimedEvent[] {
  const seed = hashSeed(callId)
  const rand = mulberry32(seed)
  const isScam = rand() > 0.4

  const events: TimedEvent[] = [{ t: 0, event: { type: 'state', value: 'monitoring' } }]

  const transcriptLines = isScam
    ? [
        'Hello, this is calling from your bank’s security department.',
        'We’ve detected unusual activity and need to verify your identity.',
        'Can you please read out the one-time code we just sent you?',
        'This is urgent — your account will be locked in ten minutes.',
      ]
    : [
        'Hey, it’s me, just calling to check in.',
        'Are we still on for dinner on Saturday?',
        'Great, I’ll see you then. Talk soon!',
      ]

  let seq = 0
  transcriptLines.forEach((text, i) => {
    const t = 2000 + i * 4000
    events.push({ t, event: { type: 'transcript', seq: seq++, speaker: 'caller', text } })
    const spoofScore = isScam ? 55 + i * 10 + rand() * 5 : 8 + rand() * 6
    events.push({ t: t + 500, event: { type: 'spoof_score', seq: seq++, score: Math.min(99, Math.round(spoofScore)) } })
    const riskScore = isScam ? 40 + i * 14 + rand() * 5 : 5 + rand() * 5
    events.push({ t: t + 800, event: { type: 'risk_score', score: Math.min(99, Math.round(riskScore)), threshold: 70 } })
  })

  events.push({
    t: 3000,
    event: {
      type: 'context_update',
      summary: isScam
        ? 'Caller claims to be from your bank and is requesting an OTP.'
        : 'Casual personal call, no financial or urgent requests detected.',
      intents: isScam ? ['impersonation', 'urgency', 'asks for OTP'] : ['personal', 'low risk'],
    },
  })

  if (isScam) {
    const alertT = 2000 + transcriptLines.length * 4000 + 500
    events.push({ t: alertT - 1500, event: { type: 'state', value: 'suspicious' } })
    events.push({
      t: alertT,
      event: {
        type: 'alert',
        level: 'scam',
        reasonMain: 'Voice likely AI-cloned and caller is requesting a bank OTP.',
        reasons: [
          'Voice print does not match a known-genuine sample',
          'Caller requested a one-time passcode',
          'High urgency / pressure language detected',
          'Caller ID does not match claimed institution',
        ],
        guardiansNotified: true,
      },
    })
    events.push({ t: alertT + 100, event: { type: 'state', value: 'alerted' } })
  }

  return events
}

function hashSeed(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
