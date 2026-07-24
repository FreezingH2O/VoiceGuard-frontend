import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant =
  | 'primary'
  | 'gold'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'outline-neutral'
  | 'outline-light'
  | 'outline-gold'
  | 'outline-danger'
  | 'outline-blue'

const variantClasses: Record<ButtonVariant, string> = {
  // coral primary works on both surfaces; on dark it lifts + glows on hover
  primary: 'bg-coral-500 text-white shadow-card transition-transform hover:bg-coral-400 hover:-translate-y-0.5 hover:shadow-glow-coral',
  // amber gradient — the app-preview theme's primary CTA
  gold: 'bg-gold-grad text-white shadow-[0_12px_28px_-14px_rgba(231,124,42,0.8)] transition-transform hover:-translate-y-0.5',
  secondary: 'bg-navy-800 text-white shadow-card hover:brightness-110',
  danger: 'bg-danger-500 text-white shadow-card hover:brightness-105',
  ghost: 'bg-transparent text-mist-300 hover:text-white',
  'outline-neutral': 'bg-white text-slate-600 border border-slate-200',
  // dark-surface secondary: hairline light outline, subtle fill on hover
  'outline-light': 'bg-white/5 text-white border border-white/15 hover:bg-white/10 hover:border-white/30',
  'outline-gold': 'bg-transparent text-gold-400 border-[1.5px] border-gold-400/60 hover:bg-gold-400/10',
  'outline-danger': 'bg-transparent text-danger-500 border-[1.5px] border-danger-500/70 hover:bg-danger-500/10',
  'outline-blue': 'bg-transparent text-blue-600 border-[1.5px] border-blue-600',
}

interface BaseProps {
  variant?: ButtonVariant
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  elderMode?: boolean
  children: ReactNode
  className?: string
}

type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { href?: undefined }

type AnchorProps = BaseProps & { href: string; target?: string; rel?: string }

export function Button(props: ButtonProps | AnchorProps) {
  const {
    variant = 'primary',
    fullWidth,
    loading,
    leftIcon,
    elderMode,
    children,
    className,
    ...rest
  } = props

  const classes = cn(
    // `font-body-sm` used to sit here, which is a no-op: font-* resolves fontFamily
    // and fontWeight, while body-sm is a fontSize token (text-body-sm). Buttons were
    // shipping with no size class and no horizontal padding at all.
    'inline-flex items-center justify-center gap-2 rounded-button px-5 text-body-sm font-semibold transition',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
    'disabled:opacity-50 disabled:pointer-events-none',
    elderMode ? 'min-h-tap-elder text-h2' : 'min-h-tap',
    fullWidth && 'w-full',
    variantClasses[variant],
    className,
  )

  const content = (
    <>
      {loading ? <Spinner /> : leftIcon}
      <span>{children}</span>
    </>
  )

  if ('href' in props && props.href) {
    const { href, target, rel } = props as AnchorProps
    return (
      <a href={href} target={target} rel={rel} className={classes}>
        {content}
      </a>
    )
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type="button" className={classes} disabled={loading || buttonRest.disabled} {...buttonRest}>
      {content}
    </button>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  )
}
