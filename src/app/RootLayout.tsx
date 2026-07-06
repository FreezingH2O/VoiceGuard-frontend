import { Outlet } from 'react-router-dom'
import { ToastProvider } from '@/components/ToastProvider'

/** App-wide providers that must wrap every route (web, preview, and bare). */
export function RootLayout() {
  return (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
  )
}
