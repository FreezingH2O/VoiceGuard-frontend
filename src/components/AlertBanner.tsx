import type { ReactNode } from 'react'
import { TriangleAlert, CircleCheck } from 'lucide-react'
import type { AlertLevel } from '@/types/domain'
import { cn } from '@/lib/cn'
import { useLang } from '@/i18n/LangProvider'
import { Button } from './Button'

interface AlertBannerProps {
  level: AlertLevel
  reasonMain: string
  reasons?: string[]
  guardiansNotified?: boolean
  onEndCall?: () => void
  onKeepTalking?: () => void
  actions?: ReactNode
}

export function AlertBanner({
  level,
  reasonMain,
  reasons,
  guardiansNotified,
  onEndCall,
  onKeepTalking,
  actions,
}: AlertBannerProps) {
  const { t } = useLang()
  const borderColor = level === 'scam' ? 'border-danger-500' : 'border-coral-500'
  const iconColor = level === 'scam' ? 'text-danger-500' : 'text-coral-500'
  const title = level === 'scam' ? t({ en: 'Likely SCAM call', th: 'น่าจะเป็นสายมิจฉาชีพ' }) : t({ en: 'Suspicious call', th: 'สายที่น่าสงสัย' })

  return (
    <div className={cn('rounded-[18px] border-2 bg-panel p-4 text-fg', borderColor)}>
      <h2 className={cn('flex items-center gap-2 text-alert-title font-bold', iconColor)}>
        <TriangleAlert className="h-7 w-7 shrink-0" strokeWidth={2.5} aria-hidden="true" />
        {title}
      </h2>
      <p className="mt-2 text-body font-medium text-fg">{reasonMain}</p>
      {reasons && reasons.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {reasons.map((r) => (
            <li key={r} className="text-body-sm font-normal text-mid">
              • {r}
            </li>
          ))}
        </ul>
      )}
      {guardiansNotified && (
        <p className="mt-3 flex items-center gap-1.5 text-body-sm font-semibold text-accent">
          <CircleCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
          {t({ en: 'Family notified', th: 'แจ้งครอบครัวแล้ว' })}
        </p>
      )}
      {actions ?? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {onEndCall && (
            <Button variant="danger" fullWidth onClick={onEndCall}>
              {t({ en: 'End Call', th: 'วางสาย' })}
            </Button>
          )}
          {onKeepTalking && (
            <Button variant="outline-light" fullWidth onClick={onKeepTalking}>
              {t({ en: 'Keep Talking', th: 'คุยต่อ' })}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
