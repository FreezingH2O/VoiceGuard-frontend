import { Link } from 'react-router-dom'
import { House, History as HistoryIcon, Users, Settings as SettingsIcon, User, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export type TabKey = 'home' | 'history' | 'family' | 'settings' | 'profile'

// Routes point into the preview zone — this tab bar renders ONLY inside the
// phone mockup now (migration spec §5, redesign §7). The web navbar handles
// navigation on real web pages, including Profile (see WebNavbar.tsx → /profile).
// Profile has no /app-preview route anymore; it only appears in the home-page
// showcase phone (showProfile), where a mock profile screen is rendered locally.
const tabs: { key: TabKey; label: string; icon: LucideIcon; to: string }[] = [
  { key: 'home', label: 'Home', icon: House, to: '/app-preview' },
  { key: 'history', label: 'History', icon: HistoryIcon, to: '/app-preview/history' },
  { key: 'family', label: 'Family', icon: Users, to: '/app-preview/family' },
  { key: 'settings', label: 'Settings', icon: SettingsIcon, to: '/app-preview/settings' },
  { key: 'profile', label: 'Profile', icon: User, to: '/app-preview' },
]

interface BottomTabBarProps {
  active: TabKey
  // When set, tabs switch by calling this instead of navigating via <Link> — used
  // to embed the phone's tab-switching standalone (e.g. on the home page) without
  // a second router (react-router forbids nesting a Router inside another Router).
  onNavigate?: (key: TabKey) => void
  // Include the Profile tab. Only the home-page showcase phone (which renders a
  // mock profile locally) sets this — the real /app-preview has no profile route.
  showProfile?: boolean
}

// Figma had zero active-tab treatment anywhere in the file despite 5 tabs always
// rendering identically — this active-state design (blue-600 top indicator + white
// vs. slate-400 icon/label) was added fresh; see DESIGN_DECISIONS.md.
export function BottomTabBar({ active, onNavigate, showProfile = false }: BottomTabBarProps) {
  const visibleTabs = showProfile ? tabs : tabs.filter((tab) => tab.key !== 'profile')
  return (
    <nav className="flex h-[68px] shrink-0 items-stretch justify-center border-t border-white/[0.06] bg-night shadow-[0_-6px_16px_rgba(0,0,0,0.35)]">
      <div className="flex w-full items-stretch">
        {visibleTabs.map((tab) => {
          const isActive = tab.key === active
          const className = cn(
            'relative flex min-h-tap flex-1 flex-col items-center justify-center gap-1',
            'transition-colors hover:bg-white/5',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-400',
            isActive ? 'text-gold-400' : 'text-mist-500',
          )
          const content = (
            <>
              {isActive && (
                <span className="absolute inset-x-6 top-0 h-[3px] rounded-full bg-gold-400" aria-hidden="true" />
              )}
              <tab.icon className="h-5 w-5" aria-hidden="true" />
              <span className={cn('text-tag', isActive && 'font-semibold')}>{tab.label}</span>
            </>
          )
          return onNavigate ? (
            <button key={tab.key} type="button" aria-current={isActive ? 'page' : undefined} className={className} onClick={() => onNavigate(tab.key)}>
              {content}
            </button>
          ) : (
            <Link key={tab.key} to={tab.to} aria-current={isActive ? 'page' : undefined} className={className}>
              {content}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
