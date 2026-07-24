import type { User } from '@/services/types'

const REFRESH_TOKEN_KEY = 'vg_refresh_token'
const MOCK_SESSION_KEY = 'vg_mock_session'

// Mock mode only: the whole app is session-local and issues no refresh token, so a
// page refresh would otherwise log you out. We persist the mock session (token +
// user) here and rehydrate it on load. Never used in real mode, where the spec
// keeps the access token in memory and relies on /auth/refresh instead.
export interface MockSession {
  accessToken: string
  user: User
}

export const mockSessionStorage = {
  get(): MockSession | null {
    try {
      const raw = localStorage.getItem(MOCK_SESSION_KEY)
      return raw ? (JSON.parse(raw) as MockSession) : null
    } catch {
      return null
    }
  },
  set(session: MockSession): void {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
  },
  clear(): void {
    localStorage.removeItem(MOCK_SESSION_KEY)
  },
}

// Spec calls for the refresh token to live in an httpOnly cookie set by the backend.
// There is no real backend yet to set one, so per the spec's own explicit fallback
// clause we fall back to localStorage here. Revisit when a real backend exists.
export const refreshTokenStorage = {
  get(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  set(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },
  clear(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
