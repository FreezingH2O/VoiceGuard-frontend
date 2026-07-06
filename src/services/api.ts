import * as authMock from './mock/auth.mock'
import * as dashboardMock from './mock/dashboard.mock'
import * as callsMock from './mock/calls.mock'
import * as familyMock from './mock/family.mock'
import * as settingsMock from './mock/settings.mock'
import * as demoMock from './mock/demo.mock'
import * as detectorTestsMock from './mock/detectorTests.mock'
import * as authReal from './real/auth.real'
import * as callsReal from './real/calls.real'
import * as demoReal from './real/demo.real'
import * as familyReal from './real/family.real'

// VITE_USE_MOCKS=true (default): everything runs on the in-memory mock layer.
// VITE_USE_MOCKS=false: the POC groups below (auth, calls, demo, family's guardian
// alert reads) hit the real backend at VITE_API_URL; groups with no real
// implementation yet (dashboard, settings, devices, consent, family CRUD) stay
// mocked so the rest of the app keeps working. Real and mock groups coexist —
// add a `services/real/*.real.ts` module and swap it in here to promote a group.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

const auth = USE_MOCKS ? authMock : authReal
const calls = USE_MOCKS ? callsMock : callsReal
const familyAlerts = USE_MOCKS ? familyMock : familyReal

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
    // Scripted scenarios stay client-side even against a real backend — the public
    // demo tree is deliberately self-contained. Only the Live Detector Test upload
    // hits the real ASR/anti-spoof pipeline.
    listScenarios: demoMock.listDemoScenarios,
    getScenario: demoMock.getDemoScenario,
    getDebrief: demoMock.getDemoDebrief,
    submitLiveTest: USE_MOCKS ? demoMock.submitLiveTest : demoReal.submitLiveTest,
  },
  // Session-local saved detector-test history (migration spec §4/§11). Always mock
  // for the PoC — no real backend yet — regardless of USE_MOCKS.
  detector: {
    listTests: detectorTestsMock.listDetectorTests,
    recordTest: detectorTestsMock.recordDetectorTest,
  },
}

export { ApiError } from './types'
