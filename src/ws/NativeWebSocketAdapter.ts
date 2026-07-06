import type { RealtimeClient } from './RealtimeClient'
import type { RealtimeInboundType, RealtimeInbound, RealtimeOutbound } from './types'
import type { ConnectionState } from '@/types/domain'

const INBOUND_TYPES: ReadonlySet<string> = new Set([
  'spoof_score',
  'transcript',
  'context_update',
  'risk_score',
  'state',
  'alert',
])

const BACKOFF_BASE_MS = 1000
const BACKOFF_MAX_MS = 15000
const MAX_RETRIES = 8

/**
 * Real WebSocket implementation of RealtimeClient. Opens wsUrl, authenticates with an
 * `{type:'auth', token}` frame once open, parses inbound JSON into the RealtimeInbound
 * union, and reconnects with exponential backoff if the socket drops (spec: show
 * "protection limited" via the 'reconnecting' connection state and retry).
 */
export class NativeWebSocketAdapter implements RealtimeClient {
  private wsUrl: string
  private wsToken: string
  private ws: WebSocket | null = null
  private handlers = new Map<RealtimeInboundType, Set<(event: never) => void>>()
  private stateHandlers = new Set<(state: ConnectionState) => void>()
  private retryCount = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private closedByUser = false
  /** Messages sent while the socket is (re)connecting, flushed on open. */
  private outbox: RealtimeOutbound[] = []

  constructor(wsUrl: string, wsToken: string) {
    this.wsUrl = wsUrl
    this.wsToken = wsToken
  }

  connect(): void {
    this.closedByUser = false
    this.open()
  }

  private open(): void {
    this.emitState(this.retryCount === 0 ? 'connecting' : 'reconnecting')
    const ws = new WebSocket(this.wsUrl)
    this.ws = ws

    ws.onopen = () => {
      this.retryCount = 0
      ws.send(JSON.stringify({ type: 'auth', token: this.wsToken }))
      this.emitState('open')
      const pending = this.outbox
      this.outbox = []
      for (const msg of pending) ws.send(JSON.stringify(msg))
    }

    ws.onmessage = (e: MessageEvent) => {
      let parsed: unknown
      try {
        parsed = JSON.parse(typeof e.data === 'string' ? e.data : '')
      } catch {
        return
      }
      if (!parsed || typeof parsed !== 'object') return
      const event = parsed as RealtimeInbound
      if (!INBOUND_TYPES.has(event.type)) return
      const set = this.handlers.get(event.type)
      if (!set) return
      for (const handler of set) (handler as (ev: RealtimeInbound) => void)(event)
    }

    ws.onclose = () => {
      if (this.ws !== ws) return
      this.ws = null
      if (this.closedByUser) return
      this.scheduleReconnect()
    }

    ws.onerror = () => {
      // onclose fires after onerror; reconnect is handled there.
    }
  }

  private scheduleReconnect(): void {
    if (this.retryCount >= MAX_RETRIES) {
      this.emitState('closed')
      return
    }
    this.retryCount += 1
    this.emitState('reconnecting')
    const delay = Math.min(BACKOFF_BASE_MS * 2 ** (this.retryCount - 1), BACKOFF_MAX_MS)
    this.retryTimer = setTimeout(() => this.open(), delay)
  }

  send(msg: RealtimeOutbound): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    } else if (!this.closedByUser) {
      this.outbox.push(msg)
    }
  }

  on<T extends RealtimeInboundType>(
    type: T,
    handler: (event: Extract<RealtimeInbound, { type: T }>) => void,
  ): () => void {
    let set = this.handlers.get(type)
    if (!set) {
      set = new Set()
      this.handlers.set(type, set)
    }
    set.add(handler as (event: never) => void)
    return () => {
      set.delete(handler as (event: never) => void)
    }
  }

  onConnectionStateChange(handler: (state: ConnectionState) => void): () => void {
    this.stateHandlers.add(handler)
    return () => {
      this.stateHandlers.delete(handler)
    }
  }

  private emitState(state: ConnectionState): void {
    for (const handler of this.stateHandlers) handler(state)
  }

  close(): void {
    this.closedByUser = true
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = null
    this.outbox = []
    this.ws?.close()
    this.ws = null
  }
}
