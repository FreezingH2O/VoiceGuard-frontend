import { useLang, type Lang } from '@/i18n/LangProvider'
import { cn } from '@/lib/cn'

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'th', label: 'TH' },
  { value: 'en', label: 'EN' },
]

/**
 * TH | EN language switcher for the web navbar (per product decision: content is
 * bilingual and the visitor chooses the view language in the top nav). `tone`
 * adapts it to the dark marketing chrome or a light surface.
 */
export function LangToggle({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  const { lang, setLang } = useLang()
  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        'inline-flex items-center rounded-pill p-0.5 text-tag font-semibold',
        tone === 'dark' ? 'bg-white/10 ring-1 ring-white/10' : 'bg-slate-100 ring-1 ring-slate-200',
        className,
      )}
    >
      {OPTIONS.map((opt) => {
        const active = lang === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(opt.value)}
            className={cn(
              'min-w-[34px] rounded-pill px-2.5 py-1 transition',
              active
                ? tone === 'dark'
                  ? 'bg-coral-500 text-white'
                  : 'bg-blue-600 text-white'
                : tone === 'dark'
                  ? 'text-mist-300 hover:text-white'
                  : 'text-slate-600 hover:text-navy-900',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
