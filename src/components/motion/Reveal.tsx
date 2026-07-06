import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  /** Extra delay (s) before this element animates in. */
  delay?: number
  /** Rise distance in px (default 24, per design.md §4). */
  y?: number
}

/**
 * Scroll-reveal wrapper: fade in + rise 24px over ~600ms ease-out when ~20%
 * visible (design.md §4). Under reduced motion it renders statically visible.
 */
export function Reveal({ children, delay = 0, y = 24, className, ...rest }: RevealProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered container — children wrapped in <RevealItem> animate in sequence
 * (~80ms apart per design.md §4).
 */
export function RevealGroup({
  children,
  stagger = 0.08,
  className,
}: {
  children: ReactNode
  stagger?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({
  children,
  className,
  y = 24,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}
