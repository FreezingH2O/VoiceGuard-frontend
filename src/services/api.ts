import * as authMock from './mock/auth.mock'
import * as dashboardMock from './mock/dashboard.mock'
import * as callsMock from './mock/calls.mock'
import * as familyMock from './mock/family.mock'
import * as settingsMock from './mock/settings.mock'
import * as demoMock from './mock/demo.mock'
import * as detectorTestsMock from './mock/detectorTests.mock'
import * as authReal from './real/auth.real'
import * as demoReal from './real/demo.real'
import * as detectorReal from './real/detector.real'

// The backend only powers the genuinely-live web features: real accounts (auth)
// and the Live Detector Test. Everything in the "phone app" preview zone
// (dashboard, calls, history, family/Elder Mode, settings, devices, consent) is
// static preview data served entirely by the in-memory mock layer — it never
// hits the backend, regardless of VITE_USE_MOCKS.
//
// VITE_USE_MOCKS=false only swaps auth + the live detector to the real backend at
// VITE_API_URL; VITE_USE_MOCKS=true (default) runs those on the mock too.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

const auth = USE_MOCKS ? authMock : authReal
const calls = callsMock // phone preview — always static/mock
const familyAlerts = familyMock // phone preview — always static/mock
// Live Detector history is a real, account-tied feature: persisted to the backend
// when mocks are off, session-local otherwise.
const detector = USE_MOCKS ? detectorTestsMock : detectorReal

export const api = {
  auth: {
    signup: auth.signup,
    login: auth.login,
  },
  devices: {
    register: settingsMock.registerDevice,
  },
  consent: {
    record: settingsMock.recordConsent,
  },
  dashboard: {
    get: dashboardMock.getDashboard,
  },
  calls: {
    start: calls.startCall,
    end: calls.endCall,
    list: calls.listCalls,
    get: calls.getCall,
    getTimeline: calls.getCallTimeline,
    report: calls.reportCall,
    share: calls.shareCall,
    submitFeedback: calls.submitCallFeedback,
  },
  settings: {
    get: settingsMock.getSettings,
    patch: settingsMock.patchSettings,
    addBlocklistEntry: settingsMock.addBlocklistEntry,
    removeBlocklistEntry: settingsMock.removeBlocklistEntry,
    addWhitelistEntry: settingsMock.addWhitelistEntry,
    removeWhitelistEntry: settingsMock.removeWhitelistEntry,
    patchNotificationPrefs: settingsMock.patchNotificationPrefs,
    deleteAccount: settingsMock.deleteAccount,
  },
  family: {
    getMe: familyMock.getMe,
    patchMe: familyMock.patchMe,
    switchRole: familyMock.switchRole,
    listGuardians: familyMock.listGuardians,
    inviteGuardian: familyMock.inviteGuardian,
    patchGuardianVisibility: familyMock.patchGuardianVisibility,
    removeGuardian: familyMock.removeGuardian,
    listWards: familyAlerts.listWards,
    listWardAlerts: familyAlerts.listWardAlerts,
    getWardAlert: familyAlerts.getWardAlert,
    notifyWardContact: familyMock.notifyWardContact,
    blockWardNumber: familyMock.blockWardNumber,
    ackWardAlert: familyAlerts.ackWardAlert,
  },
  demo: {
    // Scripted scenarios stay client-side — the public demo tree is deliberately
    // self-contained. The Live Detector Test is the ONE genuinely-live surface: it
    // ALWAYS hits the real ASR / anti-spoof / LLM pipeline, even in full-mock mode,
    // so the recorded voice gets a real transcript + scores. Everything else
    // (including the entire phone preview) honors VITE_USE_MOCKS.
    listScenarios: demoMock.listDemoScenarios,
    getScenario: demoMock.getDemoScenario,
    getDebrief: demoMock.getDemoDebrief,
    submitLiveTest: demoReal.submitLiveTest,
  },
  // Saved Live Detector history — real & account-tied. With mocks off it persists
  // to the backend (auto-saved on live-test); with mocks on it's session-local.
  detector: {
    listTests: detector.listDetectorTests,
    recordTest: detector.recordDetectorTest,
    deleteTest: detector.deleteDetectorTest,
  },
}

export { ApiError } from './types'
