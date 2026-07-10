import { db } from './db'
import { simulateNetwork } from './delay'
import { getScenarioDebrief, getScenarioDetail, listScenarios } from './scenarios.data'
import type { DemoScenarioDebrief, DemoScenarioDetail, DemoScenarioListItem, LiveTestResponse } from '../types'
import { ApiError } from '../types'

const LIVE_TEST_LIMIT = 5

export async function listDemoScenarios(): Promise<DemoScenarioListItem[]> {
  return simulateNetwork(listScenarios())
}

export async function getDemoScenario(id: string): Promise<DemoScenarioDetail> {
  const detail = getScenarioDetail(id)
  if (!detail) throw new Error(`Scenario ${id} not found`)
  return simulateNetwork(detail)
}

export async function getDemoDebrief(id: string): Promise<DemoScenarioDebrief> {
  const debrief = getScenarioDebrief(id)
  if (!debrief) throw new Error(`Scenario ${id} not found`)
  return simulateNetwork(debrief)
}

export async function submitLiveTest(clip: Blob): Promise<LiveTestResponse> {
  db.liveTestCallCount += 1
  if (db.liveTestCallCount > LIVE_TEST_LIMIT) {
    throw new ApiError(429, "You've hit the demo limit, sign up to keep testing.")
  }

  // Mock: always report a genuine human voice with high confidence. The UI shows
  // "Real voice" as (100 - spoofProb), so a random 80–99% real voice means a low
  // spoof probability of 1–20%. Randomized per call so repeated clips vary.
  const realVoice = 80 + Math.floor(Math.random() * 20) // 80..99
  const spoofProb = 100 - realVoice // 1..20
  const seed = clip.size % 100

  return simulateNetwork(
    {
      spoofProb,
      transcript: 'Hey, just checking in to see how you are doing today.',
      summary: 'Casual, low-risk conversation with no financial requests.',
      intents: ['personal', 'low risk'],
      scamProb: 2 + (seed % 8),
      reasons: ['Voice print consistent with a real human voice', 'No urgency or financial language detected'],
      latencyMs: 1500 + (seed % 400),
    },
    2000 + Math.random() * 1000,
  )
}
