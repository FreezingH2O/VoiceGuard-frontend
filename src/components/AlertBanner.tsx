import type { ReactNode } from 'react'
import { TriangleAlert, CircleCheck } from 'lucide-react'
import type { AlertLevel } from '@/types/domain'
import { cn } from '@/lib/cn'
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
  const borderColor = level === 'scam' ? 'border-danger-600' : 'border-warn-500'
  const title = level === 'scam' ? 'Likely SCAM call' : 'Suspicious call'

  return (
    <div className={cn('rounded-card border-2 bg-card p-4 text-white', borderColor)}>
      <h2 className="flex items-center gap-1.5 text-alert-title">
        <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
        {title}
      </h2>
      <p className="mt-1 text-body text-slate-200">{reasonMain}</p>
      {reasons && reasons.length > 0 && (
        <ul className="mt-2 space-y-1">
          {reasons.map((r) => (
            <li key={r} className="text-small text-slate-400">
              • {r}
            </li>
          ))}
        </ul>
      )}
      {guardiansNotified && (
        <p className="mt-2 flex items-center gap-1 text-caption text-safe-500">
          <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Family notified
        </p>
      )}
      {actions ?? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {onEndCall && (
            <Button variant="danger" fullWidth onClick={onEndCall}>
              End Call
            </Button>
          )}
          {onKeepTalking && (
            <Button variant="outline-neutral" fullWidth onClick={onKeepTalking}>
              Keep Talking
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
