import { useEffect, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PhoneMockup } from '@/components/web/PhoneMockup'
import { StatusBar } from '@/components/StatusBar'
import { TiltCard } from '@/components/motion/TiltCard'
import { EmbeddedPreviewProvider } from '@/app/EmbeddedPreview'
import { PreviewThemeProvider } from '@/app/PreviewTheme'
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen'
import { queryKeys } from '@/services/queryKeys'
import type { DashboardResponse } from '@/services/types'
import { useLang } from '@/i18n/LangProvider'

/**
 * Static sample dashboard for the hero. The landing page is always public (signed-in
 * users are redirected to /home), so the live dashboard query would 401 here — instead
 * we pre-seed this data into the isolated cache below, so DashboardScreen renders its
 * real UI without ever hitting the auth-gated fetch.
 */
// The phone renders at its native device width and is scaled down uniformly, so the
// app UI inside stays pixel-perfect. NATIVE_W matches PhoneMockup's sm width (412px);
// SCALE sets the displayed size (~255px wide).
const NATIVE_W = 412
const SCALE = 0.62

const SAMPLE_DASHBOARD: DashboardResponse = {
  protectionEnabled: true,
  today: { calls: 12, alerts: 2, highestRisk: 88 },
  lastCall: {
    callId: 'hero-call-1',
    callerNumber: '+66 2 111 3333',
    startedAt: new Date(Date.now() - 8 * 60_000).toISOString(),
    durationSec: 74,
    verdict: 'safe',
    spoofScore: 8,
    riskScore: 6,
  },
  recentAlerts: [
    {
      alertId: 'hero-alert-1',
      callId: 'hero-call-2',
      level: 'scam',
      reasonMain: 'Caller impersonating your bank, asking for a one-time code',
      createdAt: new Date(Date.now() - 42 * 60_000).toISOString(),
    },
    {
      alertId: 'hero-alert-2',
      callId: 'hero-call-3',
      level: 'suspicious',
      reasonMain: 'Unfamiliar number using urgency about a parcel delivery',
      createdAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
    },
  ],
}

/**
 * The hero visual on the landing page: the real app-preview HOME screen
 * (DashboardScreen — same component as /app-preview) glowing inside the device,
 * with the same mouse-tilt movement as the previous hero visual.
 *
 * Strictly *display-only* — the content is `inert` + pointer-events-none, with no
 * bottom tab bar and no hover shortcut, so nothing here is interactive.
 */
export function HeroAppPreviewPhone() {
  const { t } = useLang()
  const [client] = useState(() => {
    const c = new QueryClient({
      // staleTime: Infinity so the seeded sample data is never refetched.
      defaultOptions: { queries: { staleTime: Infinity, retry: false, refetchOnWindowFocus: false } },
    })
    c.setQueryData(queryKeys.dashboard, SAMPLE_DASHBOARD)
    return c
  })
  const contentRef = useRef<HTMLDivElement>(null)

  // Keep the embedded screen fully non-interactive (no focus, no tabbing in).
  useEffect(() => {
    if (contentRef.current) contentRef.current.inert = true
  }, [])

  // Render the phone at its native width, then scale the whole device down with a
  // transform — so the app UI inside keeps its exact proportions and just displays
  // smaller, instead of reflowing/cramping when the container narrows.
  return (
    <TiltCard className="flex justify-center">
      {/* Footprint box: takes the scaled size so surrounding layout reserves the right space. */}
      <div style={{ width: NATIVE_W * SCALE }} className="relative aspect-[201/437]">
        <div style={{ width: NATIVE_W, transform: `scale(${SCALE})` }} className="absolute left-0 top-0 origin-top-left">
          <PreviewThemeProvider>
            <PhoneMockup className="shadow-glow-soft !w-[412px] !max-w-none !max-h-none">
              <QueryClientProvider client={client}>
                <EmbeddedPreviewProvider value={true}>
                  <StatusBar />
                  <div className="w-full bg-coral-500 px-3 py-1 text-center text-[10px] font-semibold leading-tight text-white">
                    {t({ en: 'PREVIEW · sample data', th: 'พรีวิว · ข้อมูลตัวอย่าง' })}
                  </div>
                  <div ref={contentRef} className="flex flex-1 select-none flex-col overflow-hidden bg-night [pointer-events:none]">
                    <DashboardScreen />
                  </div>
                </EmbeddedPreviewProvider>
              </QueryClientProvider>
            </PhoneMockup>
          </PreviewThemeProvider>
        </div>
      </div>
    </TiltCard>
  )
}
