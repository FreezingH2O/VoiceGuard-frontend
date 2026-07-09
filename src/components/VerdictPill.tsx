import { Ban, Check, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { Verdict } from '@/types/domain'
import { cn } from '@/lib/cn'

const config: Record<Verdict, { label: string; icon: LucideIcon; className: string }> = {
  safe: { label: 'Safe', icon: Check, className: 'bg-gold-500 text-white' },
  suspicious: { label: 'Needs Review', icon: TriangleAlert, className: 'bg-coral-500 text-white' },
  scam: { label: 'Scam', icon: Ban, className: 'bg-danger-500 text-white' },
}

/**
 * Filled verdict pill for the dark app-preview theme (amber Safe, coral Needs
 * Review, red Scam). Always icon + label together for accessibility.
 */
export function VerdictPill({ verdict, size = 'sm' }: { verdict: Verdict; size?: 'sm' | 'md' }) {
  const { label, icon: Icon, className } = config[verdict]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill font-semibold',
        size === 'sm' ? 'px-2.5 py-1 text-caption' : 'px-3.5 py-1.5 text-body-sm',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
      {label}
    </span>
  )
}
