import { useState, type ComponentType } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PhoneMockup } from '@/components/web/PhoneMockup'
import { StatusBar } from '@/components/StatusBar'
import { BottomTabBar, type TabKey } from '@/components/BottomTabBar'
import { EmbeddedPreviewProvider } from '@/app/EmbeddedPreview'
import { PreviewThemeProvider } from '@/app/PreviewTheme'
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen'
import { CallHistoryScreen } from '@/screens/history/CallHistoryScreen'
import { FamilyScreen } from '@/screens/family/FamilyScreen'
import { SettingsScreen } from '@/screens/settings/SettingsScreen'
import { PhoneDemoProfileScreen } from '@/screens/home/PhoneDemoProfileScreen'
import { useLang } from '@/i18n/LangProvider'

const TAB_SCREENS: Record<TabKey, ComponentType> = {
  home: DashboardScreen,
  history: CallHistoryScreen,
  family: FamilyScreen,
  settings: SettingsScreen,
  profile: PhoneDemoProfileScreen,
}

/**
 * The real app-preview screens (same components as /app-preview), tab-switchable
 * inside the phone mockup on the home page — a pure mock showcase, isolated from
 * the signed-in account:
 *  - its own QueryClient, so reads/writes never share cache with the real app;
 *  - EmbeddedPreviewProvider, so screens (e.g. Settings) drop any account-mutating
 *    or session-ending actions here;
 *  - a fake Profile screen (PhoneDemoProfileScreen) instead of the real getMe one.
 * Tabs are driven by local state — react-router forbids nesting a second Router.
 */
export function HomeAppPreviewPhone({ initialTab = 'home' }: { initialTab?: TabKey } = {}) {
  const [tab, setTab] = useState<TabKey>(initialTab)
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
      }),
  )
  const { t } = useLang()
  const Screen = TAB_SCREENS[tab]

  return (
    <PreviewThemeProvider>
    <PhoneMockup className="shadow-glow-soft">
      <QueryClientProvider client={client}>
        <EmbeddedPreviewProvider value={true}>
          <StatusBar />
          <div className="w-full bg-coral-500 px-3 py-1 text-center text-[10px] font-semibold leading-tight text-white">
            {t({ en: 'PREVIEW · sample data — the real app runs on your phone', th: 'พรีวิว · ข้อมูลตัวอย่าง — แอปจริงทำงานบนมือถือของคุณ' })}
          </div>
          <main className="flex flex-1 flex-col overflow-y-auto bg-night">
            <Screen />
          </main>
          <BottomTabBar active={tab} onNavigate={setTab} showProfile />
        </EmbeddedPreviewProvider>
      </QueryClientProvider>
    </PhoneMockup>
    </PreviewThemeProvider>
  )
}
