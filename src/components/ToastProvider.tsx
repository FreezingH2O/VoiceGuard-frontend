import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ToastTone = 'success' | 'error' | 'info'

interface ToastOptions {
  message: string
  tone?: ToastTone
  durationMs?: number
}

interface ToastItem extends ToastOptions {
  id: string
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toneClasses: Record<ToastTone, string> = {
  success: 'bg-safe-500',
  error: 'bg-danger-600',
  info: 'bg-navy-800',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback(({ message, tone = 'info', durationMs = 3000 }: ToastOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((prev) => [...prev, { id, message, tone, durationMs }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, durationMs)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto max-w-full rounded-button px-4 py-3 text-small text-white shadow-card',
              toneClasses[t.tone ?? 'info'],
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
