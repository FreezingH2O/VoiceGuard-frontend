import { cn } from '@/lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string // visually-hidden accessible name
  disabled?: boolean
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
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
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        'disabled:opacity-50',
        checked ? 'bg-safe-500' : 'bg-slate-200',
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
