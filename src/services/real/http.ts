import { ApiError } from '../types'
import type { AuthResponse } from '../types'
import { refreshTokenStorage } from '@/lib/storage'

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// The access token lives in React state (AuthProvider), which this non-React module
// can't reach. AuthProvider mirrors every token change into this holder via
// setAccessToken so requests can attach it.
let accessToken: string | null = null
let onSessionRefreshed: ((auth: AuthResponse) => void) | null = null
let onSessionExpired: (() => void) | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

/** AuthProvider registers these so a background refresh updates React state too. */
export function registerSessionHooks(hooks: {
  onRefreshed: (auth: AuthResponse) => void
  onExpired: () => void
}): void {
  onSessionRefreshed = hooks.onRefreshed
  onSessionExpired = hooks.onExpired
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Set for multipart uploads — body is passed through untouched, no JSON header. */
  formData?: FormData
  query?: Record<string, string | number | undefined>
  /** Skip the auth header + refresh-retry (used by auth endpoints themselves). */
  anonymous?: boolean
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path, API_URL)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

async function rawRequest(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {}
  if (!opts.anonymous && accessToken) headers.Authorization = `Bearer ${accessToken}`
  let body: BodyInit | undefined
  if (opts.formData) {
    body = opts.formData
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }
  return fetch(buildUrl(path, opts.query), {
    method: opts.method ?? 'GET',
    headers,
    body,
    credentials: 'include',
  })
}

let refreshInFlight: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const stored = refreshTokenStorage.get()
      const res = await rawRequest('/auth/refresh', {
        method: 'POST',
        anonymous: true,
        // Backend may read the httpOnly cookie instead; body is the localStorage fallback.
        body: stored ? { refreshToken: stored } : {},
      })
      if (!res.ok) return false
      const auth = (await res.json()) as AuthResponse
      accessToken = auth.accessToken
      if (auth.refreshToken) refreshTokenStorage.set(auth.refreshToken)
      onSessionRefreshed?.(auth)
      return true
    } catch {
      return false
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

async function parseError(res: Response): Promise<ApiError> {
  let message = res.statusText || 'Request failed'
  try {
    const data = (await res.json()) as { detail?: string; message?: string; error?: string }
    message = data.detail ?? data.message ?? data.error ?? message
  } catch {
    // non-JSON error body — keep statusText
  }
  return new ApiError(res.status, message)
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res: Response
  try {
    res = await rawRequest(path, opts)
  } catch {
    throw new ApiError(0, 'Network error — check your connection and try again.')
  }

  if (res.status === 401 && !opts.anonymous) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      res = await rawRequest(path, opts)
    } else {
      onSessionExpired?.()
    }
  }

  if (!res.ok) throw await parseError(res)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
