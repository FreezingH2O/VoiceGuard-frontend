import type { ReactNode } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { RootLayout } from '@/app/RootLayout'
import { WebLayout } from '@/app/WebLayout'
import { PreviewLayout } from '@/app/PreviewLayout'
import { RequireAuth, RequireConsent, RedirectIfAuthed } from '@/app/RouteGuards'

import { LandingScreen } from '@/screens/landing/LandingScreen'
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
import { WebProfileScreen } from '@/screens/profile/WebProfileScreen'
import { HelpScreen } from '@/screens/support/HelpScreen'
import { PrivacyScreen } from '@/screens/legal/PrivacyScreen'
import { TermsScreen } from '@/screens/legal/TermsScreen'
import { LiveDetectorTestScreen } from '@/screens/demo/LiveDetectorTestScreen'

// Preview-zone auth wrapper — mock/session-local, but the app-preview screens still
// assume a signed-in user (they read `me`, settings, etc.).
const authed = (el: ReactNode) => (
  <RequireAuth>
    <RequireConsent>{el}</RequireConsent>
  </RequireAuth>
)

// Single source of truth for the app-preview screen tree (path + tab handle + element),
// shared by the real /app-preview browser route and by any standalone embedding of the
// same screens (e.g. a memory router rendered inside the phone mockup elsewhere).
export const appPreviewScreens: RouteObject[] = [
  { path: '/app-preview', handle: { zone: 'app', tabbar: 'home' }, element: <DashboardScreen /> },
  { path: '/app-preview/history', handle: { zone: 'app', tabbar: 'history' }, element: <CallHistoryScreen /> },
  { path: '/app-preview/history/:callId', handle: { zone: 'app', tabbar: 'history' }, element: <CallDetailScreen /> },
  { path: '/app-preview/call/:callId', handle: { zone: 'app', tabbar: 'home' }, element: <LiveCallMonitorScreen /> },
  { path: '/app-preview/family', handle: { zone: 'app', tabbar: 'family' }, element: <FamilyScreen /> },
  { path: '/app-preview/family/alerts/:wardId/:alertId', handle: { zone: 'app', tabbar: 'family' }, element: <GuardianAlertDetailScreen /> },
  { path: '/app-preview/settings', handle: { zone: 'app', tabbar: 'settings' }, element: <SettingsScreen /> },
]

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ---- Real web pages (navbar + footer, desktop-first) ----
      {
        element: <WebLayout />,
        children: [
          { path: '/', element: <LandingScreen /> },
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
          {
            path: '/profile',
            element: (
              <RequireAuth>
                <RequireConsent>
                  <WebProfileScreen />
                </RequireConsent>
              </RequireAuth>
            ),
          },
          // Public support & legal pages (accessible signed-in or not).
          { path: '/help', element: <HelpScreen /> },
          { path: '/privacy', element: <PrivacyScreen /> },
          { path: '/terms', element: <TermsScreen /> },
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
        children: appPreviewScreens.map((r) => ({ ...r, element: authed(r.element) })),
      },
    ],
  },
])
