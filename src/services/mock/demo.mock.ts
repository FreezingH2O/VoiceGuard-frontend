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

  // Vary the "result" a little based on clip size so repeated recordings don't look identical.
  const seed = clip.size % 100
  const isScam = seed > 45

  return simulateNetwork(
    isScam
      ? {
          spoofProb: 70 + (seed % 25),
          transcript: "Hi, it's your bank calling — please confirm the code we just texted you.",
          summary: 'Caller is requesting a one-time passcode under urgency.',
          intents: ['impersonation', 'urgency', 'asks for OTP'],
          scamProb: 65 + (seed % 30),
          reasons: ['Voice cloning artifacts detected', 'Requested a one-time passcode', 'High urgency language'],
          latencyMs: 1800 + (seed % 400),
        }
      : {
          spoofProb: 3 + (seed % 10),
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
