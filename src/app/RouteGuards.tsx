import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthed } = useAuth()
  if (!isAuthed) return <Navigate to="/signup" replace />
  return children
}

export function RequireConsent({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user?.consentRecorded) return <Navigate to="/onboarding" replace />
  return children
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { isAuthed } = useAuth()
  if (isAuthed) return <Navigate to="/home" replace />
  return children
}
