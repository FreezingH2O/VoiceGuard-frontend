import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@/services/types'
import { refreshTokenStorage } from '@/lib/storage'
import { registerSessionHooks, setAccessToken as syncHttpToken } from '@/services/real/http'

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
  // Access token lives only in memory (component state), per spec — lost on refresh.
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const setSession = useCallback((token: string, nextUser: User, refreshToken?: string) => {
    setAccessToken(token)
    syncHttpToken(token)
    setUser(nextUser)
    if (refreshToken) refreshTokenStorage.set(refreshToken)
  }, [])

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    syncHttpToken(null)
    setUser(null)
    refreshTokenStorage.clear()
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
