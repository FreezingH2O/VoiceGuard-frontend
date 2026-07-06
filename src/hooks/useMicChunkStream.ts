import { useEffect } from 'react'
import { useMediaRecorderClip } from './useMediaRecorderClip'
import type { RealtimeClient } from '@/ws/RealtimeClient'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      resolve(dataUrl.slice(dataUrl.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * Speakerphone capture for a real monitored call: records the mic in timesliced
 * chunks and sends each one to the realtime channel as an `audio_chunk` message.
 * One mic hears both parties, so chunks are tagged 'caller' and diarization is
 * left to the backend's ASR.
 */
export function useMicChunkStream(client: RealtimeClient, enabled: boolean) {
  const recorder = useMediaRecorderClip({
    onChunk: (chunk, seq) => {
      void blobToBase64(chunk).then((data) => {
        client.send({ type: 'audio_chunk', seq, speaker: 'caller', codec: 'audio/webm;codecs=opus', data })
      })
    },
  })

  const { start, stop, status, error } = recorder

  useEffect(() => {
    if (!enabled) return
    void start()
    return () => stop()
    // start/stop are stable useCallbacks from useMediaRecorderClip.
  }, [enabled, start, stop])

  return { micStatus: status, micError: error, stopMic: stop }
}
