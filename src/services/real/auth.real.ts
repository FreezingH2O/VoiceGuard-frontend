import { request, setAccessToken } from './http'
import { refreshTokenStorage } from '@/lib/storage'
import type { AuthResponse, LoginPayload, SignupPayload } from '../types'

function storeSession(auth: AuthResponse): AuthResponse {
  setAccessToken(auth.accessToken)
  if (auth.refreshToken) refreshTokenStorage.set(auth.refreshToken)
  return auth
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  return storeSession(await request<AuthResponse>('/auth/signup', { method: 'POST', body: payload }))
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return storeSession(await request<AuthResponse>('/auth/login', { method: 'POST', body: payload }))
}
