import { Check, X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string // accessible name; also the tooltip-free description for screen readers
  disabled?: boolean
  // 'gold' = amber track when on (preview app theme); 'onGold' = for use on top of
  // the gold status hero, where an amber track would disappear into the background.
  tone?: 'gold' | 'onGold'
  // Renders a visible ON / OFF word beside the track. The primary user is an older
  // adult, so state should never rest on knob position and hue alone.
  showState?: boolean
  onLabel?: string
  offLabel?: string
}

/**
 * On/off switch for the app-preview screens.
 *
 * State is carried three ways on purpose — knob position, track colour, and a glyph
 * inside the knob (check when on, cross when off) — because position-plus-colour is
 * exactly the encoding that fails for the elderly users this product targets, and
 * for anyone with reduced colour vision. `showState` adds a fourth (a word) for the
 * high-stakes toggles. Previously the `onGold` variant rendered a white knob on a
 * white track, so "on" was a blank pill with no readable state at all.
 */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
  tone = 'gold',
  showState,
  onLabel = 'ON',
  offLabel = 'OFF',
}: SwitchProps) {
  const onGold = tone === 'onGold'

  const track = checked
    ? onGold
      ? 'bg-white'
      : 'bg-gold-500'
    : onGold
      ? 'bg-black/40 ring-1 ring-inset ring-white/60' // a dark well, so "off" reads as a hole in the amber
      : 'bg-hairline/20 ring-1 ring-inset ring-hairline/25'

  // The knob has to contrast with its own track, not with the screen behind it.
  const knob = checked && onGold ? 'bg-gold-600 text-white' : 'bg-white'
  const icon = checked ? (onGold ? 'text-white' : 'text-gold-600') : 'text-slate-600'

  return (
    <span className="inline-flex items-center gap-2.5">
      {showState && (
        <span
          aria-hidden="true"
          className={cn(
            'text-label font-bold uppercase tracking-wide',
            onGold ? 'text-white' : checked ? 'text-accent' : 'text-mid',
          )}
        >
          {checked ? onLabel : offLabel}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        data-compact
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-[36px] w-[64px] shrink-0 items-center rounded-pill transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400',
          'disabled:opacity-50',
          track,
        )}
      >
        <span
          className={cn(
            'inline-flex h-[28px] w-[28px] transform items-center justify-center rounded-full shadow transition-transform',
            knob,
            checked ? 'translate-x-[32px]' : 'translate-x-[4px]',
          )}
        >
          {checked ? (
            <Check className={cn('h-4 w-4', icon)} strokeWidth={3.5} aria-hidden="true" />
          ) : (
            <X className={cn('h-4 w-4', icon)} strokeWidth={3.5} aria-hidden="true" />
          )}
        </span>
      </button>
    </span>
  )
}
