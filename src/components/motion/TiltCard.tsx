import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Mouse-tilt wrapper for the hero visual (design.md §5): maps cursor position
 * within the element to a small ±7° rotateX/rotateY, spring-smoothed, resets
 * on pointer leave. Disabled under prefers-reduced-motion (renders flat).
 */
export function TiltCard({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 150, damping: 18, mass: 0.5 })
  const springY = useSpring(rotateY, { stiffness: 150, damping: 18, mass: 0.5 })

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * max * 2)
    rotateX.set(-py * max * 2)
  }

  function onMouseLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} className={className} style={{ perspective: 1000 }} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <motion.div style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}>{children}</motion.div>
    </div>
  )
}
