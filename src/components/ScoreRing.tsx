import { cn } from '@/lib/cn'

type RingTone = 'safe' | 'warn' | 'danger' | 'blue'

const strokeByTone: Record<RingTone, string> = {
  safe: '#2E9E6B',
  warn: '#EB7449',
  danger: '#D93A3A',
  blue: '#2B3A9F',
}

interface ScoreRingProps {
  value: number // 0-100
  size: number // px diameter — 84 / 80 / 74 depending on screen
  label: string // e.g. "FAKE VOICE" | "SCAM RISK" | "REAL VOICE"
  tone: RingTone
  valueTextClassName?: string
}

export function ScoreRing({ value, size, label, tone, valueTextClassName = 'text-ring-value' }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const strokeWidth = Math.max(4, Math.round(size * 0.09))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference * (1 - clamped / 100)

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(139,145,181,0.25)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeByTone[tone]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ transition: 'stroke-dashoffset 300ms ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold text-white tabular-nums', valueTextClassName)}>{Math.round(clamped)}%</span>
        </div>
      </div>
      <span className="text-tag uppercase tracking-wide text-slate-400 text-center">{label}</span>
    </div>
  )
}
