import type { ConnectionState } from '@/types/domain'
import type { RealtimeInbound, RealtimeInboundType, RealtimeOutbound } from './types'

/**
 * Shared interface implemented by both the demo scheduler and the (currently synthetic)
 * live client, so LiveCallMonitorScreen never needs to know which one it's talking to.
 */
export interface RealtimeClient {
  connect(): void
  send(msg: RealtimeOutbound): void
  on<T extends RealtimeInboundType>(
    type: T,
    handler: (event: Extract<RealtimeInbound, { type: T }>) => void,
  ): () => void
  onConnectionStateChange(handler: (state: ConnectionState) => void): () => void
  close(): void
}

/** Optional extra surface implemented only by clients that support scrubbing playback. */
export interface PlaybackControls {
  pause(): void
  resume(): void
  restart(): void
  setPlaybackRate(rate: 1 | 2): void
  skipToAlert(): void
}

export function hasPlaybackControls(
  client: RealtimeClient,
): client is RealtimeClient & PlaybackControls {
  return typeof (client as Partial<PlaybackControls>).restart === 'function'
}
