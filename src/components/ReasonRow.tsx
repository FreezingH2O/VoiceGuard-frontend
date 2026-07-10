import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ReasonRowProps {
  icon?: ReactNode
  index?: number
  text: string
  tone?: 'neutral' | 'danger' | 'warn'
}

const toneTextClasses = {
  neutral: 'text-mid',
  danger: 'text-danger-500',
  warn: 'text-coral-500',
} as const

export function ReasonRow({ icon, index, text, tone = 'neutral' }: ReasonRowProps) {
  return (
    <div className="flex items-start gap-3">
      {typeof index === 'number' ? (
        <span
          aria-hidden="true"
          className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-tag font-bold text-gold-400"
        >
          {index}
        </span>
      ) : (
        <span aria-hidden="true" className="shrink-0 text-body">
          {icon}
        </span>
      )}
      <p className={cn('text-small', toneTextClasses[tone])}>{text}</p>
    </div>
  )
}
