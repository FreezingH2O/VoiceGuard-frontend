import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Headline word-by-word mask reveal on load (design.md §4). Pass the headline as
 * an array of words; each rises out from a clipped mask, staggered. Accent words
 * can be marked by wrapping in a fragment via `renderWord`.
 */
export function HeroReveal({
  words,
  className,
  wordClassName,
}: {
  words: { text: string; className?: string }[]
  className?: string
  wordClassName?: string
}) {
  const reduced = useReducedMotion()

  if (reduced) {
    return (
      <h1 className={className}>
        {words.map((w, i) => (
          <span key={i} className={w.className ?? wordClassName}>
            {w.text}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </h1>
    )
  }

  return (
    <h1 className={className} aria-label={words.map((w) => w.text).join(' ')}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom">
          <motion.span
            className={`inline-block ${w.className ?? wordClassName ?? ''}`}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.09 }}
          >
            {w.text}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </h1>
  )
}

/** Fade-and-rise for the subhead / CTA row that follows the headline reveal. */
export function HeroFollow({ children, delay = 0.5 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion()
  if (reduced) return <>{children}</>
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
