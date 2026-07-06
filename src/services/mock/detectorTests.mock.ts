import { simulateNetwork } from './delay'
import type { LiveTestResponse } from '../types'

/**
 * Session-local store of the user's live detector results (migration spec §4/§10,
 * §11 GET /me/detector-tests — mocked for the PoC). Resets on reload like the rest
 * of the mock layer. This is the one "real, account-tied" surface on the web home.
 */
export interface DetectorTestRecord {
  id: string
  spoofProb: number
  scamProb: number
  createdAt: string
}

const tests: DetectorTestRecord[] = []

export async function listDetectorTests(): Promise<DetectorTestRecord[]> {
  // Most recent first.
  return simulateNetwork([...tests].reverse(), 200)
}

export function recordDetectorTest(result: Pick<LiveTestResponse, 'spoofProb' | 'scamProb'>): DetectorTestRecord {
  const record: DetectorTestRecord = {
    id: `dt-${tests.length + 1}-${Date.now()}`,
    spoofProb: result.spoofProb,
    scamProb: result.scamProb,
    createdAt: new Date().toISOString(),
  }
  tests.push(record)
  return record
}
