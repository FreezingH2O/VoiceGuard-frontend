import type { ReactNode } from 'react'
import { Children } from 'react'
import { cn } from '@/lib/cn'

/**
 * Infinite horizontal auto-scrolling row (design.md §4). Duplicates its children
 * once and translates -50% forever; pauses on hover. Under reduced motion the CSS
 * `animation` is neutralised globally, so it simply renders a static strip.
 */
export function Marquee({
  children,
  className,
  itemClassName,
  speedClassName = 'animate-marquee',
}: {
  children: ReactNode
  className?: string
  itemClassName?: string
  speedClassName?: string
}) {
  const items = Children.toArray(children)
  return (
    <div className={cn('group relative overflow-hidden', className)}>
      <div className={cn('flex w-max min-w-full shrink-0 items-center group-hover:[animation-play-state:paused]', speedClassName)}>
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {items.map((item, i) => (
              <div key={`${copy}-${i}`} className={cn('shrink-0', itemClassName)}>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
