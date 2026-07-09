import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Realistic phone device frame (redesign spec §7). The existing mobile screens
 * render *inside* the screen viewport, which is a fixed-size flex column with its
 * own internal scroll — so the phone shape is intentional showcase chrome, not a
 * limitation. Full-width on `sm`, fixed ~412px device on larger screens.
 *
 * The frame models a modern titanium-rail iPhone: a machined metal band (subtle
 * vertical gradient + hairline highlights), a thin black bezel, a Dynamic Island,
 * and physical side buttons — so it reads as a real device rather than a rounded box.
 */
export function PhoneMockup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        // Outer titanium rail: metallic vertical gradient + edge highlights.
        'relative rounded-[56px] p-[3px]',
        'bg-gradient-to-b from-[#6b6e74] via-[#3a3d42] to-[#2a2c30]',
        'shadow-[0_2px_0_rgba(255,255,255,0.35),0_40px_80px_-24px_rgba(0,0,0,0.75)]',
        // Real iPhone screen proportions, width-driven so the frame never reads "squat".
        'aspect-[201/437] w-full max-w-[404px] max-h-[min(900px,88vh)] sm:w-[412px]',
        className,
      )}
    >
      {/* Inner black bezel between metal rail and glass */}
      <div className="relative h-full w-full rounded-[53px] bg-black p-[10px] ring-1 ring-white/10">
        {/* Screen viewport — fills the bezel, with internal scroll */}
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[44px] bg-night">
          {/* Dynamic Island */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[10px] z-20 flex h-[30px] w-[104px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-3"
          >
            {/* front camera lens with a faint blue reflection */}
            <span className="h-2.5 w-2.5 rounded-full bg-[#0b0f1a] ring-1 ring-white/10">
              <span className="block h-1 w-1 translate-x-[3px] translate-y-[3px] rounded-full bg-blue-500/60" />
            </span>
          </div>

          {/* Soft diagonal screen reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 rounded-[44px] bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.07]"
          />

          {children}
        </div>
      </div>

      {/* Physical side buttons */}
      <span
        aria-hidden="true"
        className="absolute -left-[3px] top-[112px] h-9 w-[3px] rounded-l bg-gradient-to-b from-[#55585e] to-[#2a2c30]"
      />
      <span
        aria-hidden="true"
        className="absolute -left-[3px] top-[168px] h-16 w-[3px] rounded-l bg-gradient-to-b from-[#55585e] to-[#2a2c30]"
      />
      <span
        aria-hidden="true"
        className="absolute -left-[3px] top-[248px] h-16 w-[3px] rounded-l bg-gradient-to-b from-[#55585e] to-[#2a2c30]"
      />
      <span
        aria-hidden="true"
        className="absolute -right-[3px] top-[196px] h-24 w-[3px] rounded-r bg-gradient-to-b from-[#55585e] to-[#2a2c30]"
      />
    </div>
  )
}
