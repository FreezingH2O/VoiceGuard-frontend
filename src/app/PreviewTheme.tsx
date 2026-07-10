import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ThemePref = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'vg-theme-pref'

interface PreviewThemeValue {
  pref: ThemePref
  resolved: ResolvedTheme
  setPref: (pref: ThemePref) => void
}

const PreviewThemeContext = createContext<PreviewThemeValue | null>(null)

function readStoredPref(): ThemePref {
  if (typeof localStorage === 'undefined') return 'dark'
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'dark'
}

function systemPrefersDark(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Light/dark theming for the app-preview phone. Renders a `display:contents`
 * wrapper carrying `data-vg-theme`, so the --vg-* CSS variables (index.css) flip
 * for everything inside without adding a layout box. Defaults to dark; the choice
 * persists in localStorage and is shared across every phone host in the session.
 */
export function PreviewThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(readStoredPref)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved: ResolvedTheme = pref === 'system' ? (systemDark ? 'dark' : 'light') : pref

  const value = useMemo<PreviewThemeValue>(
    () => ({
      pref,
      resolved,
      setPref: (next) => {
        setPrefState(next)
        try {
          localStorage.setItem(STORAGE_KEY, next)
        } catch {
          /* storage unavailable — keep in-memory only */
        }
      },
    }),
    [pref, resolved],
  )

  return (
    <PreviewThemeContext.Provider value={value}>
      <div data-vg-theme={resolved} style={{ display: 'contents' }}>
        {children}
      </div>
    </PreviewThemeContext.Provider>
  )
}

/**
 * Returns the theme controls, or null when rendered outside a PreviewThemeProvider
 * (e.g. a phone host that isn't themed). Callers should hide theme UI when null.
 */
export function usePreviewTheme(): PreviewThemeValue | null {
  return useContext(PreviewThemeContext)
}
