import type { CallListQuery } from './types'

export const queryKeys = {
  dashboard: ['dashboard'] as const,
  settings: ['settings'] as const,
  me: ['me'] as const,
  calls: (query: CallListQuery) => ['calls', query] as const,
  call: (id: string) => ['call', id] as const,
  callTimeline: (id: string) => ['call', id, 'timeline'] as const,
  guardians: ['guardians'] as const,
  wards: ['wards'] as const,
  wardAlerts: (wardId: string) => ['wards', wardId, 'alerts'] as const,
  wardAlert: (wardId: string, alertId: string) => ['wards', wardId, 'alerts', alertId] as const,
  demoScenarios: ['demoScenarios'] as const,
  demoScenario: (id: string) => ['demoScenarios', id] as const,
  demoDebrief: (id: string) => ['demoScenarios', id, 'debrief'] as const,
  detectorTests: ['detectorTests'] as const,
}
