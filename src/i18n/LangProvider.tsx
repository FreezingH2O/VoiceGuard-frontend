import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'th'

/** A piece of copy that exists in both languages. `th` is optional — falls back
 * to `en` when a Thai string hasn't been authored for a given leaf. */
export type Localized<T = string> = { en: T; th?: T }

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  /** Resolve a bilingual pair to the active language (with EN fallback). */
  t: <T>(pair: Localized<T>) => T
}

const LangContext = createContext<LangContextValue | null>(null)
const STORAGE_KEY = 'vg.lang'

function initialLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'th') return stored
  // Default to Thai for the primary audience when the browser prefers it.
  return navigator.language?.toLowerCase().startsWith('th') ? 'th' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      window.localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore private-mode storage failures */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback(<T,>(pair: Localized<T>): T => (lang === 'th' ? (pair.th ?? pair.en) : pair.en), [lang])

  const value = useMemo<LangContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
