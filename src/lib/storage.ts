const REFRESH_TOKEN_KEY = 'vg_refresh_token'

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
