import { cn } from '@/lib/cn'

interface SkeletonProps {
  variant?: 'line' | 'card' | 'circle'
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({ variant = 'line', width, height, className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={{ width, height }}
      className={cn(
        'animate-pulse bg-slate-200/40',
        variant === 'line' && 'h-4 rounded',
        variant === 'card' && 'h-24 rounded-card',
        variant === 'circle' && 'rounded-full',
        className,
      )}
    />
  )
}
