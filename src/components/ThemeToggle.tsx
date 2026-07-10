import { Moon, Sun } from 'lucide-react'
import { usePreviewTheme } from '@/app/PreviewTheme'
import { cn } from '@/lib/cn'

/**
 * Sun/moon toggle for a single phone preview. Reads the nearest PreviewThemeProvider,
 * so each phone flips independently. Small enough to live in the mock status bar,
 * making it available on every phone screen without per-screen wiring.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = usePreviewTheme()
  // No provider (an unthemed phone host) → no toggle, rather than a dead button.
  if (!theme) return null
  const { resolved, setPref } = theme
  const isDark = resolved === 'dark'
  return (
    <button
      type="button"
      onClick={() => setPref(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full border border-hairline/15 bg-hairline/5 text-accent transition hover:bg-hairline/10',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400',
        className,
      )}
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  )
}
