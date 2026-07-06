import { db } from './db'
import { simulateNetwork } from './delay'
import type { AuthResponse, LoginPayload, SignupPayload } from '../types'
import { ApiError } from '../types'

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const user = {
    id: `u-${crypto.randomUUID().slice(0, 8)}`,
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    role: 'elder' as const,
    consentRecorded: false,
  }
  db.users.push(user)
  db.currentUserId = user.id
  return simulateNetwork({ accessToken: `mock-token-${user.id}`, user })
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const user = db.users.find((u) => (payload.phone && u.phone === payload.phone) || (payload.email && u.email === payload.email))
  if (!user) {
    throw new ApiError(404, 'No account found with those details.')
  }
  db.currentUserId = user.id
  return simulateNetwork({ accessToken: `mock-token-${user.id}`, user })
}
