import type { ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/app/RootLayout'
import { WebLayout } from '@/app/WebLayout'
import { PreviewLayout } from '@/app/PreviewLayout'
import { RequireAuth, RequireConsent, RedirectIfAuthed } from '@/app/RouteGuards'

import { LandingScreen } from '@/screens/landing/LandingScreen'
import { HowItWorksScreen } from '@/screens/marketing/HowItWorksScreen'
import { WebHomeScreen } from '@/screens/home/WebHomeScreen'
import { SignUpScreen } from '@/screens/auth/SignUpScreen'
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen'
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen'
import { LiveCallMonitorScreen } from '@/screens/call/LiveCallMonitorScreen'
import { CallHistoryScreen } from '@/screens/history/CallHistoryScreen'
import { CallDetailScreen } from '@/screens/history/CallDetailScreen'
import { FamilyScreen } from '@/screens/family/FamilyScreen'
import { GuardianAlertDetailScreen } from '@/screens/family/GuardianAlertDetailScreen'
import { SettingsScreen } from '@/screens/settings/SettingsScreen'
import { ProfileScreen } from '@/screens/profile/ProfileScreen'
import { DemoScenarioPickerScreen } from '@/screens/demo/DemoScenarioPickerScreen'
import { DemoIncomingCallScreen } from '@/screens/demo/DemoIncomingCallScreen'
import { DemoDebriefScreen } from '@/screens/demo/DemoDebriefScreen'
import { LiveDetectorTestScreen } from '@/screens/demo/LiveDetectorTestScreen'

// Preview-zone auth wrapper — mock/session-local, but the app-preview screens still
// assume a signed-in user (they read `me`, settings, etc.).
const authed = (el: ReactNode) => (
  <RequireAuth>
    <RequireConsent>{el}</RequireConsent>
  </RequireAuth>
)

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ---- Real web pages (navbar + footer, desktop-first) ----
      {
        element: <WebLayout />,
        children: [
          { path: '/', element: <LandingScreen /> },
          { path: '/how-it-works', element: <HowItWorksScreen /> },
          { path: '/demo/live-test', element: <LiveDetectorTestScreen /> },
          {
            path: '/home',
            element: (
              <RequireAuth>
                <RequireConsent>
                  <WebHomeScreen />
                </RequireConsent>
              </RequireAuth>
            ),
          },
        ],
      },

      // ---- Bare pages (own full-screen layout) ----
      {
        path: '/signup',
        element: (
          <RedirectIfAuthed>
            <SignUpScreen />
          </RedirectIfAuthed>
        ),
      },
      {
        path: '/onboarding',
        element: (
          <RequireAuth>
            <OnboardingScreen />
          </RequireAuth>
        ),
      },

      // ---- Preview zone: phone mockup on a designed web page ----
      {
        element: <PreviewLayout />,
        children: [
          // Scripted demo (public)
          { path: '/demo', handle: { zone: 'demo' }, element: <DemoScenarioPickerScreen /> },
          { path: '/demo/call/:scenarioId', handle: { zone: 'demo' }, element: <DemoIncomingCallScreen /> },
          { path: '/demo/monitor/:scenarioId', handle: { zone: 'demo' }, element: <LiveCallMonitorScreen /> },
          { path: '/demo/debrief/:scenarioId', handle: { zone: 'demo' }, element: <DemoDebriefScreen /> },

          // Mobile app preview (auth, mock data)
          { path: '/app-preview', handle: { zone: 'app', tabbar: 'home' }, element: authed(<DashboardScreen />) },
          { path: '/app-preview/history', handle: { zone: 'app', tabbar: 'history' }, element: authed(<CallHistoryScreen />) },
          { path: '/app-preview/history/:callId', handle: { zone: 'app', tabbar: 'history' }, element: authed(<CallDetailScreen />) },
          { path: '/app-preview/call/:callId', handle: { zone: 'app', tabbar: 'home' }, element: authed(<LiveCallMonitorScreen />) },
          { path: '/app-preview/family', handle: { zone: 'app', tabbar: 'family' }, element: authed(<FamilyScreen />) },
          { path: '/app-preview/family/alerts/:wardId/:alertId', handle: { zone: 'app', tabbar: 'family' }, element: authed(<GuardianAlertDetailScreen />) },
          { path: '/app-preview/settings', handle: { zone: 'app', tabbar: 'settings' }, element: authed(<SettingsScreen />) },
          { path: '/app-preview/profile', handle: { zone: 'app', tabbar: 'profile' }, element: authed(<ProfileScreen />) },
        ],
      },
    ],
  },
])
