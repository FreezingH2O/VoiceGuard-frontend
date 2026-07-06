import { Link } from 'react-router-dom'
import { House, History as HistoryIcon, Users, Settings as SettingsIcon, User, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export type TabKey = 'home' | 'history' | 'family' | 'settings' | 'profile'

// Routes point into the preview zone — this 5-tab bar renders ONLY inside the
// phone mockup now (migration spec §5, redesign §7). The web navbar handles
// navigation on real web pages.
const tabs: { key: TabKey; label: string; icon: LucideIcon; to: string }[] = [
  { key: 'home', label: 'Home', icon: House, to: '/app-preview' },
  { key: 'history', label: 'History', icon: HistoryIcon, to: '/app-preview/history' },
  { key: 'family', label: 'Family', icon: Users, to: '/app-preview/family' },
  { key: 'settings', label: 'Settings', icon: SettingsIcon, to: '/app-preview/settings' },
  { key: 'profile', label: 'Profile', icon: User, to: '/app-preview/profile' },
]

interface BottomTabBarProps {
  active: TabKey
}

// Figma had zero active-tab treatment anywhere in the file despite 5 tabs always
// rendering identically — this active-state design (blue-600 top indicator + white
// vs. slate-400 icon/label) was added fresh; see DESIGN_DECISIONS.md.
export function BottomTabBar({ active }: BottomTabBarProps) {
  return (
    <nav className="flex h-[68px] shrink-0 items-stretch justify-center bg-navy-950 shadow-[0_-6px_4px_rgba(0,0,0,0.25)]">
      <div className="flex w-full items-stretch">
        {tabs.map((tab) => {
          const isActive = tab.key === active
          return (
            <Link
              key={tab.key}
              to={tab.to}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex min-h-tap flex-1 flex-col items-center justify-center gap-0.5',
                'transition-colors hover:bg-white/5',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600',
                isActive ? 'text-white' : 'text-slate-400',
              )}
            >
              {isActive && <span className="absolute top-0 h-[3px] w-8 rounded-full bg-blue-600" aria-hidden="true" />}
              <tab.icon className="h-5 w-5" aria-hidden="true" />
              <span className={cn('text-tag', isActive && 'font-semibold')}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
