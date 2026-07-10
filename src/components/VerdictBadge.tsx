import { CircleCheck, TriangleAlert, ShieldAlert, type LucideIcon } from 'lucide-react'
import type { Verdict } from '@/types/domain'
import { cn } from '@/lib/cn'
import { useLang, type Localized } from '@/i18n/LangProvider'

const config: Record<Verdict, { label: Localized; icon: LucideIcon; bg: string; text: string }> = {
  safe: { label: { en: 'Safe', th: 'ปลอดภัย' }, icon: CircleCheck, bg: 'bg-safe-100', text: 'text-safe-500' },
  suspicious: { label: { en: 'Suspicious', th: 'น่าสงสัย' }, icon: TriangleAlert, bg: 'bg-warn-100', text: 'text-warn-500' },
  scam: { label: { en: 'Scam', th: 'มิจฉาชีพ' }, icon: ShieldAlert, bg: 'bg-danger-100', text: 'text-danger-600' },
}

interface VerdictBadgeProps {
  verdict: Verdict
  size?: 'sm' | 'md'
}

/**
 * Always renders icon + label text + background tone together — never color alone —
 * per the spec's accessibility requirement.
 */
export function VerdictBadge({ verdict, size = 'sm' }: VerdictBadgeProps) {
  const { t } = useLang()
  const { label, icon: Icon, bg, text } = config[verdict]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-3 py-1 font-medium',
        size === 'sm' ? 'text-small' : 'text-body-sm',
        bg,
        text,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
      {t(label)}
    </span>
  )
}
