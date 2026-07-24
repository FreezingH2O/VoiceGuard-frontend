import { db } from './db'
import { simulateNetwork } from './delay'
import type { AuthResponse, LoginPayload, SignupPayload } from '../types'

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
  let user = db.users.find((u) => (payload.phone && u.phone === payload.phone) || (payload.email && u.email === payload.email))
  if (!user) {
    // The mock store is session-local, so real accounts (in the backend DB) and any
    // account you created in a previous session aren't in this in-memory list. Rather
    // than dead-end the demo with "no account", log the person into the mock preview
    // by creating a mock user on the fly for whatever phone/email they entered.
    user = {
      id: `u-${crypto.randomUUID().slice(0, 8)}`,
      name: payload.email?.split('@')[0] ?? 'Guest',
      phone: payload.phone ?? '',
      email: payload.email ?? '',
      role: 'elder' as const,
      consentRecorded: false,
    }
    db.users.push(user)
  }
  db.currentUserId = user.id
  return simulateNetwork({ accessToken: `mock-token-${user.id}`, user })
}
