import { db } from './db'
import { simulateNetwork } from './delay'
import type {
  CallDetail,
  CallListQuery,
  CallListResponse,
  CallTimelineResponse,
  FeedbackPayload,
  ReportPayload,
  SharePayload,
  StartCallPayload,
  StartCallResponse,
} from '../types'

const PAGE_SIZE_DEFAULT = 20

export async function startCall(_payload: StartCallPayload): Promise<StartCallResponse> {
  if (!db.settings.protectionEnabled) {
    return simulateNetwork({ monitoring: false, reason: 'protection_disabled' })
  }
  const callId = `call-${crypto.randomUUID().slice(0, 8)}`
  return simulateNetwork({ monitoring: true, callId, wsUrl: `mock://${callId}`, wsToken: 'mock-token' })
}

export async function endCall(_callId: string): Promise<{ ok: true }> {
  return simulateNetwork({ ok: true })
}

export async function listCalls(query: CallListQuery): Promise<CallListResponse> {
  let items = db.calls
  if (query.verdict) items = items.filter((c) => c.verdict === query.verdict)
  if (query.q) {
    const q = query.q.toLowerCase()
    items = items.filter((c) => c.callerNumber.toLowerCase().includes(q))
  }
  const limit = query.limit ?? PAGE_SIZE_DEFAULT
  const page = query.page ?? 0
  const start = page * limit
  const pageItems = items.slice(start, start + limit)
  return simulateNetwork({
    items: pageItems,
    nextPage: start + limit < items.length ? page + 1 : null,
    total: items.length,
  })
}

export async function getCall(callId: string): Promise<CallDetail> {
  const call = db.calls.find((c) => c.callId === callId)
  if (!call) throw new Error(`Call ${callId} not found`)
  return simulateNetwork(call)
}

export async function getCallTimeline(callId: string): Promise<CallTimelineResponse> {
  const call = db.calls.find((c) => c.callId === callId)
  const threshold = 70
  if (!call) return simulateNetwork({ points: [], threshold })
  const points = Array.from({ length: 6 }, (_, i) => {
    const progress = i / 5
    return {
      t: i * 20,
      spoof: Math.round(Math.max(0, call.spoofScore * progress - (5 - i) * 2)),
      scam: Math.round(Math.max(0, call.riskScore * progress - (5 - i) * 2)),
    }
  })
  return simulateNetwork({ points, threshold })
}

export async function reportCall(_callId: string, _payload: ReportPayload): Promise<{ ok: true }> {
  return simulateNetwork({ ok: true })
}

export async function shareCall(_callId: string, _payload: SharePayload): Promise<{ ok: true }> {
  return simulateNetwork({ ok: true })
}

export async function submitCallFeedback(_callId: string, _payload: FeedbackPayload): Promise<{ ok: true }> {
  return simulateNetwork({ ok: true })
}
