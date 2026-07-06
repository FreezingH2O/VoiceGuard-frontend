import { Outlet } from 'react-router-dom'
import { WebNavbar } from '@/components/web/WebNavbar'
import { WebFooter } from '@/components/web/WebFooter'
import { GrainOverlay } from '@/components/motion/GrainOverlay'
import { useLenis } from '@/hooks/useLenis'

/** Chrome for the dark marketing/live pages (Landing, How It Works, Live
 * Detector, Web Home): translucent dark navbar, smooth momentum scrolling, navy
 * footer, near-black canvas + grain texture per design.md §1/§4. */
export function WebLayout() {
  useLenis()
  return (
    <div className="on-dark relative flex min-h-dvh flex-col bg-ink-950 text-white">
      <GrainOverlay />
      <WebNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <WebFooter />
    </div>
  )
}
