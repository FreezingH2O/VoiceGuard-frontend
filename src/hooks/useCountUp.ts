import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { useReducedMotion } from './useReducedMotion'

/**
 * Counts a metric up from 0 to `end` when it scrolls into view (design.md §4).
 * Under reduced motion it snaps to the final value immediately. Returns the ref to
 * attach and the current display value.
 */
export function useCountUp(end: number, durationMs = 1400) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduced = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setValue(end)
      return
    }
    let raf = 0
    let start: number | null = null
    const step = (ts: number) => {
      if (start === null) start = ts
      const p = Math.min(1, (ts - start) / durationMs)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(end * eased)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced, end, durationMs])

  return { ref, value }
}
