import { simulateNetwork } from './delay'
import type { DetectorTestRecord, LiveTestResponse } from '../types'

/**
 * Session-local store of the user's live detector results (used when
 * VITE_USE_MOCKS=true). Resets on reload. With mocks off, the real backend at
 * /me/detector-tests persists these instead (see services/real/detector.real.ts).
 */
const tests: DetectorTestRecord[] = []

export async function listDetectorTests(): Promise<DetectorTestRecord[]> {
  // Most recent first.
  return simulateNetwork([...tests].reverse(), 200)
}

export function recordDetectorTest(result: LiveTestResponse): DetectorTestRecord {
  const record: DetectorTestRecord = {
    id: `dt-${tests.length + 1}-${Date.now()}`,
    spoofProb: result.spoofProb,
    scamProb: result.scamProb,
    transcript: result.transcript,
    summary: result.summary,
    intents: result.intents,
    reasons: result.reasons,
    latencyMs: result.latencyMs,
    createdAt: new Date().toISOString(),
  }
  tests.push(record)
  return record
}

export async function deleteDetectorTest(id: string): Promise<{ ok: true }> {
  const idx = tests.findIndex((t) => t.id === id)
  if (idx !== -1) tests.splice(idx, 1)
  return simulateNetwork({ ok: true }, 150)
}
