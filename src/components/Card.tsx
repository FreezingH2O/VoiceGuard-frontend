import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type CardSurface = 'card' | 'navy-900' | 'white' | 'transparent'
type CardPadding = 'sm' | 'md' | 'lg'

const surfaceClasses: Record<CardSurface, string> = {
  card: 'bg-card text-white',
  'navy-900': 'bg-navy-900 text-white',
  white: 'bg-white text-navy-900',
  transparent: 'bg-transparent',
}

const paddingClasses: Record<CardPadding, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

interface CardProps {
  surface?: CardSurface
  padding?: CardPadding
  bordered?: boolean
  borderColor?: string
  className?: string
  children: ReactNode
  as?: 'div' | 'a' | 'button'
  onClick?: () => void
}

export function Card({
  surface = 'card',
  padding = 'md',
  bordered,
  borderColor,
  className,
  children,
  as: Tag = 'div',
  onClick,
}: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'rounded-card shadow-card',
        surfaceClasses[surface],
        paddingClasses[padding],
        bordered && (borderColor ? `border-2 ${borderColor}` : 'border border-slate-200'),
        onClick && 'text-left w-full',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
