import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type PillTone = 'neutral' | 'blue' | 'safe' | 'warn' | 'danger'
type PillSize = 'xs' | 'sm'

const toneClasses: Record<PillTone, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  blue: 'bg-blue-600/10 text-blue-600',
  safe: 'bg-safe-100 text-safe-500',
  warn: 'bg-warn-100 text-warn-500',
  danger: 'bg-danger-100 text-danger-600',
}

interface PillProps {
  tone?: PillTone
  size?: PillSize
  icon?: ReactNode
  active?: boolean
  className?: string
  children: ReactNode
}

export function Pill({ tone = 'neutral', size = 'sm', icon, active, className, children }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-3 py-1',
        size === 'xs' ? 'text-tag' : 'text-micro',
        active ? 'bg-blue-600 text-white' : toneClasses[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

interface FilterChipProps {
  active?: boolean
  onClick?: () => void
  children: ReactNode
}

/** Tappable variant of Pill used for Call History's filter chips. */
export function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-tap rounded-pill px-4 text-body-sm transition',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        active ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200',
      )}
    >
      {children}
    </button>
  )
}

export type BannerTone = 'demo' | 'live'

const bannerClasses: Record<BannerTone, string> = {
  demo: 'bg-coral-500 text-white',
  live: 'bg-blue-600 text-white',
}

interface BannerProps {
  tone: BannerTone
  children: ReactNode
}

/** Full-width DEMO / LIVE indicator strip shown at the top of demo screens. */
export function Banner({ tone, children }: BannerProps) {
  return (
    <div className={cn('w-full py-1.5 text-center text-caption font-semibold', bannerClasses[tone])}>
      {children}
    </div>
  )
}
