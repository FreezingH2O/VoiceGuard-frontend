import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_DURATION_SEC = 30

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopped' | 'denied'

export interface RecorderOptions {
  /**
   * Streaming mode: emit each recorded chunk as it becomes available
   * (MediaRecorder timeslice), for feeding a live WebSocket. When set, there is
   * no duration cap and the final `blob` is still assembled on stop.
   */
  onChunk?: (chunk: Blob, seq: number) => void
  /** Chunk interval in ms for streaming mode (default 4000, per spec's 3-5s). */
  timesliceMs?: number
}

export function useMediaRecorderClip(options?: RecorderOptions) {
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [elapsedSec, setElapsedSec] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const seqRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const streaming = !!options?.onChunk

  const clearTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop()
    clearTimer()
  }, [clearTimer])

  const start = useCallback(async () => {
    setError(null)
    setBlob(null)
    setElapsedSec(0)
    seqRef.current = 0
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = (e) => {
        if (e.data.size === 0) return
        chunksRef.current.push(e.data)
        optionsRef.current?.onChunk?.(e.data, seqRef.current++)
      }
      recorder.onstop = () => {
        setBlob(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }))
        setStatus('stopped')
        streamRef.current?.getTracks().forEach((t) => t.stop())
      }
      if (optionsRef.current?.onChunk) {
        recorder.start(optionsRef.current.timesliceMs ?? 4000)
      } else {
        recorder.start()
      }
      setStatus('recording')
      intervalRef.current = setInterval(() => {
        setElapsedSec((prev) => {
          const next = prev + 1
          // The duration cap only applies to one-shot clips (Live Detector Test);
          // streaming mode runs for the length of the monitored call.
          if (!optionsRef.current?.onChunk && next >= MAX_DURATION_SEC) stop()
          return next
        })
      }, 1000)
    } catch {
      setStatus('denied')
      setError('Microphone access was denied. You can enable it in your browser settings.')
    }
  }, [stop])

  const reset = useCallback(() => {
    clearTimer()
    setStatus('idle')
    setBlob(null)
    setError(null)
    setElapsedSec(0)
  }, [clearTimer])

  useEffect(() => () => {
    clearTimer()
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [clearTimer])

  return {
    status,
    elapsedSec,
    blob,
    error,
    start,
    stop,
    reset,
    streaming,
    maxDurationSec: MAX_DURATION_SEC,
  }
}
