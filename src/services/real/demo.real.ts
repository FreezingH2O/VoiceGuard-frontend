import { request } from './http'
import type { LiveTestResponse } from '../types'

// Only the Live Detector Test goes to the real backend — the scripted demo
// scenarios/debriefs are intentionally client-side (see api.ts).

export async function submitLiveTest(clip: Blob): Promise<LiveTestResponse> {
  const formData = new FormData()
  formData.append('audio', clip, 'clip.webm')
  return request('/demo/live-test', { method: 'POST', formData })
}
