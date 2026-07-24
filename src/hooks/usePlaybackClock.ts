import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Elapsed playback time in ms that honours pause and playback rate.
 *
 * The call monitor previously read its clock from `useCountUpTimer`, a plain
 * 1s wall-clock interval, and scheduled its auto-advance to the debrief with a
 * one-shot `setTimeout`. Neither knew about the demo's Pause button or its 2x
 * control, so pausing froze the transcript while the on-screen timer kept
 * counting and the screen still jumped to the debrief on the original schedule.
 * This advances only while `running`, and in step with `rate`.
 */
export function usePlaybackClock({ running, rate }: { running: boolean; rate: number }) {
  const [ms, setMs] = useState(0)
  const elapsedRef = useRef(0)

  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      elapsedRef.current += (now - last) * rate
      last = now
      setMs(elapsedRef.current)
    }, 200)
    return () => clearInterval(id)
  }, [running, rate])

  /** Jump the clock — for Restart (0) and Skip to alert (the alert's timestamp). */
  const seek = useCallback((toMs: number) => {
    elapsedRef.current = toMs
    setMs(toMs)
  }, [])

  return [ms, seek] as const
}
