import { Outlet } from 'react-router-dom'
import { WebNavbar } from '@/components/web/WebNavbar'
import { WebFooter } from '@/components/web/WebFooter'
import { useLenis } from '@/hooks/useLenis'

/** Chrome for the dark marketing/live pages (Landing, How It Works, Live
 * Detector, Web Home): translucent dark navbar, smooth momentum scrolling, navy
 * footer. Near-black navy canvas per design.md §1. */
export function WebLayout() {
  useLenis()
  return (
    <div className="on-dark flex min-h-dvh flex-col bg-ink-950 text-white">
      <WebNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <WebFooter />
    </div>
  )
}
