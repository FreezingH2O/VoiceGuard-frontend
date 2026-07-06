import { Signal, BatteryFull } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StatusBarProps {
  transparent?: boolean
}

/** Purely presentational device-status-bar mimic. */
export function StatusBar({ transparent }: StatusBarProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex h-[38px] items-center justify-between px-5 text-white',
        transparent ? 'bg-transparent' : 'bg-navy-950',
      )}
    >
      <span className="text-small font-semibold">9:41</span>
      <span className="flex items-center gap-1.5">
        <Signal className="h-3.5 w-3.5" />
        <BatteryFull className="h-4 w-4" />
      </span>
    </div>
  )
}
