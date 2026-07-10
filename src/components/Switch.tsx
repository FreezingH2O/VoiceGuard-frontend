import { cn } from '@/lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string // visually-hidden accessible name
  disabled?: boolean
  // 'gold' = amber track when on (preview app theme); 'onGold' = white track for
  // use on top of the gold status hero, where an amber track would disappear.
  tone?: 'gold' | 'onGold'
}

const trackOn: Record<NonNullable<SwitchProps['tone']>, string> = {
  gold: 'bg-gold-500',
  onGold: 'bg-white',
}

export function Switch({ checked, onChange, label, disabled, tone = 'gold' }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-[26px] w-[44px] shrink-0 items-center rounded-pill transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400',
        'disabled:opacity-50',
        checked ? trackOn[tone] : 'bg-hairline/25',
      )}
    >
      <span
        className={cn(
          'inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[21px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  )
}
