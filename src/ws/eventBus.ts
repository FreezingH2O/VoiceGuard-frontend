import type { ConnectionState } from '@/types/domain'
import type { RealtimeInbound, RealtimeInboundType } from './types'

type Handler<T extends RealtimeInboundType> = (
  event: Extract<RealtimeInbound, { type: T }>,
) => void
type ConnectionHandler = (state: ConnectionState) => void

type AnyHandler = (event: RealtimeInbound) => void

/** Tiny typed pub/sub shared by DemoSchedulerClient and LiveWebSocketClient. */
export class EventBus {
  private handlers = new Map<RealtimeInboundType, Set<AnyHandler>>()
  private connectionHandlers = new Set<ConnectionHandler>()

  on<T extends RealtimeInboundType>(type: T, handler: Handler<T>): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set())
    const set = this.handlers.get(type)!
    const anyHandler = handler as unknown as AnyHandler
    set.add(anyHandler)
    return () => set.delete(anyHandler)
  }

  emit(event: RealtimeInbound): void {
    const set = this.handlers.get(event.type)
    if (!set) return
    for (const handler of set) handler(event)
  }

  onConnectionState(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler)
    return () => this.connectionHandlers.delete(handler)
  }

  emitConnectionState(state: ConnectionState): void {
    for (const handler of this.connectionHandlers) handler(state)
  }

  clear(): void {
    this.handlers.clear()
    this.connectionHandlers.clear()
  }
}
