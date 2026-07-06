import type { RealtimeClient } from './RealtimeClient'
import type { RealtimeInboundType, RealtimeInbound, RealtimeOutbound } from './types'
import type { ConnectionState } from '@/types/domain'
import { DemoSchedulerClient } from './DemoSchedulerClient'
import { NativeWebSocketAdapter } from './NativeWebSocketAdapter'
import { synthesizeCallTimeline } from './synthesizeCallTimeline'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

/**
 * Client used for /call/:callId. Since no backend exists yet, it wraps a
 * DemoSchedulerClient seeded with a synthesized (but deterministic-per-call) timeline
 * behind the identical RealtimeClient interface a real socket would expose. Swapping to
 * a real backend means implementing NativeWebSocketAdapter and flipping VITE_USE_MOCKS.
 */
export class LiveWebSocketClient implements RealtimeClient {
  private impl: RealtimeClient

  constructor(callId: string, wsUrl: string, wsToken: string) {
    this.impl = USE_MOCKS
      ? new DemoSchedulerClient(synthesizeCallTimeline(callId))
      : new NativeWebSocketAdapter(wsUrl, wsToken)
  }

  connect(): void {
    this.impl.connect()
  }
  send(msg: RealtimeOutbound): void {
    this.impl.send(msg)
  }
  on<T extends RealtimeInboundType>(
    type: T,
    handler: (event: Extract<RealtimeInbound, { type: T }>) => void,
  ): () => void {
    return this.impl.on(type, handler)
  }
  onConnectionStateChange(handler: (state: ConnectionState) => void): () => void {
    return this.impl.onConnectionStateChange(handler)
  }
  close(): void {
    this.impl.close()
  }
}
