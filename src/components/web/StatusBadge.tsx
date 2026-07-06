import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type StatusKind = 'live' | 'available' | 'coming-soon' | 'preview'

/**
 * The honesty mechanism (design.md §5, voiceguard-spec §4). Every status is
 * visually distinct: LIVE/AVAILABLE read as real-and-usable (teal/blue, a live
 * dot); COMING SOON/PREVIEW read as not-yet / simulated (coral, muted). Never
 * decorative — only used to mark what is real vs simulated.
 */
const config: Record<StatusKind, { label: string; dot: boolean; className: string }> = {
  live: {
    label: 'LIVE',
    dot: true,
    className: 'bg-teal-400/15 text-teal-400 ring-1 ring-teal-400/30',
  },
  available: {
    label: 'AVAILABLE',
    dot: true,
    className: 'bg-blue-500/15 text-[#8ea0ff] ring-1 ring-blue-500/30',
  },
  'coming-soon': {
    label: 'COMING SOON',
    dot: false,
    className: 'bg-coral-500/12 text-coral-400 ring-1 ring-coral-500/30',
  },
  preview: {
    label: 'PREVIEW',
    dot: false,
    className: 'bg-coral-500 text-white',
  },
}

export function StatusBadge({
  kind,
  children,
  className,
}: {
  kind: StatusKind
  children?: ReactNode
  className?: string
}) {
  const c = config[kind]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-mono text-tag font-semibold uppercase tracking-wide',
        c.className,
        className,
      )}
    >
      {c.dot && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children ?? c.label}
    </span>
  )
}
