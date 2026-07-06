import { request } from './http'
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

export async function startCall(payload: StartCallPayload): Promise<StartCallResponse> {
  return request('/calls', { method: 'POST', body: payload })
}

export async function endCall(callId: string): Promise<{ ok: true }> {
  return request(`/calls/${callId}/end`, { method: 'POST' })
}

export async function listCalls(query: CallListQuery): Promise<CallListResponse> {
  return request('/calls', { query: { ...query } })
}

export async function getCall(callId: string): Promise<CallDetail> {
  return request(`/calls/${callId}`)
}

export async function getCallTimeline(callId: string): Promise<CallTimelineResponse> {
  return request(`/calls/${callId}/timeline`)
}

export async function reportCall(callId: string, payload: ReportPayload): Promise<{ ok: true }> {
  return request(`/calls/${callId}/report`, { method: 'POST', body: payload })
}

export async function shareCall(callId: string, payload: SharePayload): Promise<{ ok: true }> {
  return request(`/calls/${callId}/share`, { method: 'POST', body: payload })
}

export async function submitCallFeedback(callId: string, payload: FeedbackPayload): Promise<{ ok: true }> {
  return request(`/calls/${callId}/feedback`, { method: 'POST', body: payload })
}
