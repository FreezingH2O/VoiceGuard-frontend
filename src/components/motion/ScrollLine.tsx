import { motion, useScroll, useTransform } from 'framer-motion'
import type { RefObject } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * The scroll-drawn connecting line (design.md §6): an SVG line whose draw
 * progress is bound to the scroll position of `containerRef`, not a timer —
 * scrolling back up naturally reverses it. Vertical by default (Roadmap).
 * Under prefers-reduced-motion it renders fully drawn.
 */
export function ScrollLine({
  containerRef,
  className,
  color = '#EB7449',
}: {
  containerRef: RefObject<HTMLElement | null>
  className?: string
  color?: string
}) {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start 0.8', 'end 0.4'] })
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <svg
      aria-hidden="true"
      className={className}
      width="2"
      height="100%"
      viewBox="0 0 2 100"
      preserveAspectRatio="none"
    >
      <line x1="1" y1="0" x2="1" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      {reduced ? (
        <line x1="1" y1="0" x2="1" y2="100" stroke={color} strokeWidth="2" />
      ) : (
        <motion.line x1="1" y1="0" x2="1" y2="100" stroke={color} strokeWidth="2" style={{ pathLength }} />
      )}
    </svg>
  )
}
