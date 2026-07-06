import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Realistic phone device frame (redesign spec §7). The existing mobile screens
 * render *inside* the screen viewport, which is a fixed-size flex column with its
 * own internal scroll — so the phone shape is intentional showcase chrome, not a
 * limitation. Full-width on `sm`, fixed ~380px device on larger screens.
 */
export function PhoneMockup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative rounded-[44px] bg-gradient-to-b from-navy-800 to-navy-950 p-2.5 shadow-2xl ring-1 ring-white/10 sm:rounded-[52px] sm:p-3',
        'w-full max-w-[400px] sm:w-[404px]',
        className,
      )}
    >
      {/* Screen viewport — fixed height with internal scroll */}
      <div className="relative flex h-[min(812px,78vh)] w-full flex-col overflow-hidden rounded-[34px] bg-navy-950 sm:rounded-[42px]">
        {/* Notch */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-2 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-navy-950"
        />
        {children}
      </div>
    </div>
  )
}
