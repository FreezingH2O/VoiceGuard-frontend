import { Signal, BatteryFull } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ThemeToggle } from '@/components/ThemeToggle'

interface StatusBarProps {
  transparent?: boolean
}

/**
 * Device-status-bar mimic. The mock time/signal/battery are decorative
 * (aria-hidden), but the trailing sun/moon control is a real theme toggle so
 * every phone that renders a StatusBar gets its own light/dark switch.
 */
export function StatusBar({ transparent }: StatusBarProps) {
  return (
    <div
      className={cn(
        'flex h-[38px] items-center justify-between px-5 text-fg',
        transparent ? 'bg-transparent' : 'bg-night',
      )}
    >
      <span aria-hidden="true" className="text-small font-semibold">
        9:41
      </span>
      <span className="flex items-center gap-2.5">
        <ThemeToggle />
        <span aria-hidden="true" className="flex items-center gap-1.5">
          <Signal className="h-3.5 w-3.5" />
          <BatteryFull className="h-4 w-4" />
        </span>
      </span>
    </div>
  )
}
