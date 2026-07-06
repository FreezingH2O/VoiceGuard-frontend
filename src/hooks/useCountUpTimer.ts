import { useEffect, useState } from 'react'

export function useCountUpTimer(active: boolean): number {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [active])

  return seconds
}
