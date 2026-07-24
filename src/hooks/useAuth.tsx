import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@/services/types'
import { mockSessionStorage, refreshTokenStorage } from '@/lib/storage'
import { setCurrentUser as setMockCurrentUser } from '@/services/mock/db'
import { registerSessionHooks, setAccessToken as syncHttpToken } from '@/services/real/http'

// Mock mode persists the session across refreshes; real mode keeps the access token
// in memory only (per spec) and restores via /auth/refresh.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

interface AuthContextValue {
  user: User | null
  accessToken: string | null
  isAuthed: boolean
  setSession: (accessToken: string, user: User, refreshToken?: string) => void
  updateUser: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // In mock mode, rehydrate a persisted session so a refresh doesn't log you out.
  // Runs once during first render (before child screens fire their queries), so it
  // also re-establishes the current user in the reseeded mock store.
  const [restored] = useState<{ token: string | null; user: User | null }>(() => {
    if (!USE_MOCKS) return { token: null, user: null }
    const session = mockSessionStorage.get()
    if (!session) return { token: null, user: null }
    syncHttpToken(session.accessToken)
    setMockCurrentUser(session.user)
    return { token: session.accessToken, user: session.user }
  })

  // Real mode: access token lives only in memory (per spec) — lost on refresh.
  const [accessToken, setAccessToken] = useState<string | null>(restored.token)
  const [user, setUser] = useState<User | null>(restored.user)

  const setSession = useCallback((token: string, nextUser: User, refreshToken?: string) => {
    setAccessToken(token)
    syncHttpToken(token)
    setUser(nextUser)
    if (refreshToken) refreshTokenStorage.set(refreshToken)
    if (USE_MOCKS) {
      mockSessionStorage.set({ accessToken: token, user: nextUser })
      setMockCurrentUser(nextUser)
    }
  }, [])

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser)
    if (USE_MOCKS) {
      const existing = mockSessionStorage.get()
      if (existing) mockSessionStorage.set({ accessToken: existing.accessToken, user: nextUser })
      setMockCurrentUser(nextUser)
    }
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    syncHttpToken(null)
    setUser(null)
    refreshTokenStorage.clear()
    if (USE_MOCKS) mockSessionStorage.clear()
  }, [])

  // Keep React state in step with the HTTP client's background refresh/expiry
  // (real-backend mode only; the hooks are simply never called under mocks).
  useEffect(() => {
    registerSessionHooks({
      onRefreshed: (auth) => {
        setAccessToken(auth.accessToken)
        setUser(auth.user)
      },
      onExpired: () => {
        setAccessToken(null)
        syncHttpToken(null)
        setUser(null)
        refreshTokenStorage.clear()
      },
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, accessToken, isAuthed: !!accessToken, setSession, updateUser, logout }),
    [user, accessToken, setSession, updateUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
