import { EventBus } from './eventBus'
import type { RealtimeClient, PlaybackControls } from './RealtimeClient'
import type { RealtimeInboundType, RealtimeInbound, RealtimeOutbound, TimedEvent } from './types'

/**
 * Plays a fixed list of timestamped events on a timer, emitting the same inbound
 * message shapes the real WebSocket uses. Powers both /demo/monitor/:scenarioId
 * (literal scenario timelines) and, wrapped internally, /call/:callId (synthesized
 * timelines) — see LiveWebSocketClient.
 */
export class DemoSchedulerClient implements RealtimeClient, PlaybackControls {
  private bus = new EventBus()
  private timers: ReturnType<typeof setTimeout>[] = []
  private playbackRate: 1 | 2 = 1
  private elapsedAtLastSchedule = 0
  private scheduleStartedAtMs = 0
  private running = false
  private timeline: TimedEvent[]

  constructor(timeline: TimedEvent[]) {
    this.timeline = timeline
  }

  connect(): void {
    this.bus.emitConnectionState('open')
    this.schedule(0)
  }

  send(_msg: RealtimeOutbound): void {
    // No-op in demo/synthetic playback — kept for interface parity with a real socket.
  }

  on<T extends RealtimeInboundType>(
    type: T,
    handler: (event: Extract<RealtimeInbound, { type: T }>) => void,
  ): () => void {
    return this.bus.on(type, handler)
  }

  onConnectionStateChange(handler: (state: import('@/types/domain').ConnectionState) => void) {
    return this.bus.onConnectionState(handler)
  }

  close(): void {
    this.clearTimers()
    this.bus.emitConnectionState('closed')
  }

  pause(): void {
    this.elapsedAtLastSchedule = this.elapsedMs()
    this.clearTimers()
    this.running = false
  }

  resume(): void {
    this.schedule(this.elapsedAtLastSchedule)
  }

  restart(): void {
    this.schedule(0)
  }

  setPlaybackRate(rate: 1 | 2): void {
    const elapsed = this.elapsedMs()
    this.playbackRate = rate
    this.schedule(elapsed)
  }

  skipToAlert(): void {
    const alertEvent = this.timeline.find((e) => e.event.type === 'alert')
    this.schedule(alertEvent ? alertEvent.t : 0)
  }

  private schedule(fromMs: number): void {
    this.clearTimers()
    this.elapsedAtLastSchedule = fromMs
    this.scheduleStartedAtMs = performance.now()
    this.running = true
    for (const { t, event } of this.timeline) {
      if (t < fromMs) continue
      const delay = (t - fromMs) / this.playbackRate
      const id = setTimeout(() => this.bus.emit(event), delay)
      this.timers.push(id)
    }
  }

  private elapsedMs(): number {
    if (!this.running) return this.elapsedAtLastSchedule
    return this.elapsedAtLastSchedule + (performance.now() - this.scheduleStartedAtMs) * this.playbackRate
  }

  private clearTimers(): void {
    this.timers.forEach(clearTimeout)
    this.timers = []
  }
}
