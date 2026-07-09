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
  const borderColor = level === 'scam' ? 'border-danger-500' : 'border-coral-500'
  const iconColor = level === 'scam' ? 'text-danger-500' : 'text-coral-500'
  const title = level === 'scam' ? 'Likely SCAM call' : 'Suspicious call'

  return (
    <div className={cn('rounded-[18px] border-2 bg-panel p-4 text-white', borderColor)}>
      <h2 className={cn('flex items-center gap-1.5 text-alert-title', iconColor)}>
        <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
        {title}
      </h2>
      <p className="mt-1 text-body text-mist-300">{reasonMain}</p>
      {reasons && reasons.length > 0 && (
        <ul className="mt-2 space-y-1">
          {reasons.map((r) => (
            <li key={r} className="text-small text-mist-500">
              • {r}
            </li>
          ))}
        </ul>
      )}
      {guardiansNotified && (
        <p className="mt-2 flex items-center gap-1 text-caption text-gold-400">
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
            <Button variant="outline-light" fullWidth onClick={onKeepTalking}>
              Keep Talking
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
