import { useEffect, useReducer } from 'react'
import type { RealtimeClient } from '@/ws/RealtimeClient'
import type { CallState, ConnectionState } from '@/types/domain'

interface TranscriptLine {
  seq: number
  speaker: 'caller' | 'user'
  text: string
}

interface AlertInfo {
  level: 'suspicious' | 'scam'
  reasonMain: string
  reasons: string[]
  guardiansNotified: boolean
}

interface RealtimeCallState {
  spoofScore: number
  riskScore: number
  threshold: number
  transcript: TranscriptLine[]
  contextSummary: string | null
  intents: string[]
  callState: CallState
  alert: AlertInfo | null
  connectionState: ConnectionState
}

type Action =
  | { type: 'spoof_score'; score: number }
  | { type: 'risk_score'; score: number; threshold: number }
  | { type: 'transcript'; line: TranscriptLine }
  | { type: 'context_update'; summary: string; intents: string[] }
  | { type: 'state'; value: CallState }
  | { type: 'alert'; alert: AlertInfo }
  | { type: 'connection'; state: ConnectionState }

const initialState: RealtimeCallState = {
  spoofScore: 0,
  riskScore: 0,
  threshold: 70,
  transcript: [],
  contextSummary: null,
  intents: [],
  callState: 'monitoring',
  alert: null,
  connectionState: 'connecting',
}

function reducer(state: RealtimeCallState, action: Action): RealtimeCallState {
  switch (action.type) {
    case 'spoof_score':
      return { ...state, spoofScore: action.score }
    case 'risk_score':
      return { ...state, riskScore: action.score, threshold: action.threshold }
    case 'transcript':
      return { ...state, transcript: [...state.transcript, action.line] }
    case 'context_update':
      return { ...state, contextSummary: action.summary, intents: action.intents }
    case 'state':
      return { ...state, callState: action.value }
    case 'alert':
      return { ...state, alert: action.alert }
    case 'connection':
      return { ...state, connectionState: action.state }
    default:
      return state
  }
}

export function useRealtimeCallState(client: RealtimeClient) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const unsubs = [
      client.on('spoof_score', (e) => dispatch({ type: 'spoof_score', score: e.score })),
      client.on('risk_score', (e) => dispatch({ type: 'risk_score', score: e.score, threshold: e.threshold })),
      client.on('transcript', (e) => dispatch({ type: 'transcript', line: { seq: e.seq, speaker: e.speaker, text: e.text } })),
      client.on('context_update', (e) => dispatch({ type: 'context_update', summary: e.summary, intents: e.intents })),
      client.on('state', (e) => dispatch({ type: 'state', value: e.value })),
      client.on('alert', (e) =>
        dispatch({
          type: 'alert',
          alert: { level: e.level, reasonMain: e.reasonMain, reasons: e.reasons, guardiansNotified: e.guardiansNotified },
        }),
      ),
      client.onConnectionStateChange((s) => dispatch({ type: 'connection', state: s })),
    ]
    client.connect()
    return () => {
      unsubs.forEach((unsub) => unsub())
      client.close()
    }
  }, [client])

  return state
}
