import { Outlet, useMatches } from 'react-router-dom'
import { StatusBar } from '@/components/StatusBar'
import { BottomTabBar, type TabKey } from '@/components/BottomTabBar'
import { useLang } from '@/i18n/LangProvider'

export interface PreviewHandle {
  tabbar?: TabKey
  zone?: 'app' | 'demo'
}

/**
 * The phone's screen content — status bar, PREVIEW banner, routed screen, tab bar.
 * Reads the active tab off the current route's `handle`, so it works the same
 * whether it's rendered under the real browser router (PreviewLayout, /app-preview)
 * or a standalone memory router embedding the same screens elsewhere.
 */
export function PreviewPhoneScreen() {
  const { t } = useLang()
  const matches = useMatches()
  const handle = matches.at(-1)?.handle as PreviewHandle | undefined
  const zone = handle?.zone ?? 'demo'
  const tabbar = handle?.tabbar

  return (
    <>
      <StatusBar />
      {zone === 'app' && (
        <div className="w-full bg-coral-500 px-3 py-1 text-center text-[10px] font-semibold leading-tight text-white">
          {t({ en: 'PREVIEW · sample data — the real app runs on your phone', th: 'พรีวิว · ข้อมูลตัวอย่าง — แอปจริงทำงานบนมือถือของคุณ' })}
        </div>
      )}
      {/*
        A block scroll container, not a flex one. As `flex flex-1 flex-col` this
        never scrolled: a column flex item defaults to min-height:auto, so main grew
        to its content instead of shrinking, and PhoneMockup's overflow-hidden clipped
        the overflow. min-h-0 fixes the shrink; dropping the inner flex context also
        stops `flex-1` on each screen's root from pinning it to the viewport height.
        min-h-full on the child keeps short screens filling the device.
      */}
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-night [&>*]:min-h-full">
        <Outlet />
      </main>
      {tabbar && <BottomTabBar active={tabbar} />}
    </>
  )
}
