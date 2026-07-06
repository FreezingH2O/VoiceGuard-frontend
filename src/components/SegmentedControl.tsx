import { cn } from '@/lib/cn'

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  'aria-label': string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex rounded-input bg-slate-100 p-1">
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              'min-h-tap flex-1 rounded-input text-body-sm transition',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
              isActive ? 'bg-white text-navy-900 shadow-card' : 'text-slate-600',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
