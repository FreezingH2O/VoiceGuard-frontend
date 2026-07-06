import type { AlertLevel, CallState } from '@/types/domain'

export type RealtimeInbound =
  | { type: 'spoof_score'; seq: number; score: number }
  | { type: 'transcript'; seq: number; speaker: 'caller' | 'user'; text: string }
  | { type: 'context_update'; summary: string; intents: string[] }
  | { type: 'risk_score'; score: number; threshold: number }
  | { type: 'state'; value: CallState }
  | {
      type: 'alert'
      level: AlertLevel
      reasonMain: string
      reasons: string[]
      guardiansNotified: boolean
    }

export type RealtimeInboundType = RealtimeInbound['type']

export type RealtimeOutbound =
  | { type: 'audio_chunk'; seq: number; speaker: 'caller' | 'user'; codec: string; data: string }
  | { type: 'user_action'; action: 'ended_call' | 'kept_talking' | 'muted' }

/** A scenario/demo event carries its own playback timestamp (ms from playback start). */
export interface TimedEvent {
  t: number
  event: RealtimeInbound
}
