import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from './useReducedMotion'

/**
 * Smooth momentum scrolling for marketing/live pages only (design.md §4). Mounted
 * by WebLayout; disabled entirely under `prefers-reduced-motion`. Also exposes a
 * global `lenis` so anchor links can `scrollTo` with easing.
 */
export function useLenis(enabled = true) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!enabled || reduced) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    ;(window as unknown as { lenis?: Lenis }).lenis = lenis

    let frame = 0
    function raf(time: number) {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      delete (window as unknown as { lenis?: Lenis }).lenis
    }
  }, [enabled, reduced])
}

/** Smooth-scroll to an in-page anchor, falling back to native when Lenis is off. */
export function scrollToAnchor(hash: string) {
  const id = hash.replace(/^#/, '')
  const el = document.getElementById(id)
  if (!el) return
  const lenis = (window as unknown as { lenis?: Lenis }).lenis
  if (lenis) lenis.scrollTo(el, { offset: -72 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
