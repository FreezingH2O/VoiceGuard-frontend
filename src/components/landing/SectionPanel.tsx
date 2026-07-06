import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Colored glow bled from a section boundary (landing-fixes.md Fix 4). Theme
 * colors only — coral / blue / teal, never the reference site's green/purple.
 */
export type GlowColor = 'coral-blue' | 'blue-teal' | 'teal'

const GLOW_GRADIENT: Record<GlowColor, string> = {
  'coral-blue': 'radial-gradient(closest-side, rgba(235,116,73,0.55), rgba(43,58,159,0.3) 55%, transparent 78%)',
  'blue-teal': 'radial-gradient(closest-side, rgba(43,58,159,0.5), rgba(52,214,196,0.3) 55%, transparent 78%)',
  teal: 'radial-gradient(closest-side, rgba(52,214,196,0.5), transparent 76%)',
}

/**
 * A large, saturated radial glow blob bleeding from a panel's boundary edge
 * (design.md §4 / landing-visual-corrections.md Fix 1). Sized big enough
 * (~800-1000px) that roughly half sits inside the section near the edge —
 * the parent section clips it via overflow-hidden, so it reads as color
 * bleeding out from under the panel's rounded corner rather than a thin
 * tinted strip. Dark/gradient sections only; never rendered on light panels.
 */
export function SectionGlow({
  position,
  color,
  drift = false,
  className,
}: {
  position: 'top' | 'bottom'
  color: GlowColor
  drift?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute left-1/2 z-0 h-[560px] w-[820px] -translate-x-1/2 blur-[100px] lg:h-[680px] lg:w-[980px]',
        position === 'top' ? '-top-[340px] lg:-top-[400px]' : '-bottom-[340px] lg:-bottom-[400px]',
        drift && 'animate-drift',
        className,
      )}
      style={{ backgroundImage: GLOW_GRADIENT[color] }}
    />
  )
}

/**
 * Reusable stacked-panel section wrapper (landing-visual-corrections.md).
 * Rule: plain white/light sections are always flat and passive — they never
 * round or glow. The dark (or gradient) section at each boundary is the one
 * that rounds toward its neighbor and physically overlaps it (negative
 * margin + raised z-index + a downward/upward shadow), so panels read as
 * stacked cards laid on top of each other rather than a flat joined scroll.
 */
export function SectionPanel({
  id,
  mode = 'dark',
  tone = 'base',
  roundedTop = false,
  roundedBottom = false,
  glowTop,
  glowBottom,
  driftGlow = false,
  zIndex,
  className,
  contentClassName,
  children,
}: {
  id?: string
  mode?: 'dark' | 'light' | 'gradient'
  /** Dark-mode only: 'base' = ink-950, 'raised' = ink-900 band. */
  tone?: 'base' | 'raised'
  roundedTop?: boolean
  roundedBottom?: boolean
  glowTop?: GlowColor
  glowBottom?: GlowColor
  driftGlow?: boolean
  /**
   * Overrides the stacking order for panels whose rounded edge faces another
   * rounded/dark panel (rather than a plain light one), where the default
   * roundedTop/roundedBottom z-index tier would tie. Higher wins the overlap.
   */
  zIndex?: number
  className?: string
  contentClassName?: string
  children: ReactNode
}) {
  const isPlain = mode === 'light'
  const hasGlow = !isPlain && Boolean(glowTop || glowBottom)

  return (
    <section
      id={id}
      className={cn(
        'relative scroll-mt-20 px-6 py-24 sm:px-8 lg:py-32',
        mode === 'light' && 'bg-slate-50 text-slate-900',
        mode === 'gradient' && 'bg-glow-grad text-white',
        mode === 'dark' && (tone === 'raised' ? 'bg-ink-900' : 'bg-ink-950'),
        hasGlow && 'overflow-hidden',
        !isPlain &&
          roundedBottom &&
          'z-10 -mb-6 rounded-b-[32px] shadow-[0_36px_70px_-24px_rgba(0,0,0,0.6)] lg:-mb-8 lg:rounded-b-[48px]',
        !isPlain &&
          roundedTop &&
          'z-10 -mt-6 rounded-t-[32px] shadow-[0_-28px_60px_-24px_rgba(0,0,0,0.55)] lg:-mt-8 lg:rounded-t-[48px]',
        className,
      )}
      style={zIndex !== undefined ? { zIndex } : undefined}
    >
      {!isPlain && glowTop && <SectionGlow position="top" color={glowTop} drift={driftGlow} />}
      {!isPlain && glowBottom && <SectionGlow position="bottom" color={glowBottom} drift={driftGlow} />}
      <div className={cn('relative z-[1] mx-auto max-w-content', contentClassName)}>{children}</div>
    </section>
  )
}
