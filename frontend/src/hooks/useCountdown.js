import { useEffect, useState } from 'react'

const remaining = (target, serverOffset) => Math.max(0, Date.parse(target) - (Date.now() + serverOffset))

export function useCountdown(target, serverTime) {
  const [milliseconds, setMilliseconds] = useState(0)

  useEffect(() => {
    if (!target) return undefined
    const offset = serverTime ? Date.parse(serverTime) - Date.now() : 0
    const tick = () => setMilliseconds(remaining(target, offset))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [target, serverTime])

  const totalSeconds = Math.ceil(milliseconds / 1000)
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return { label: `${hours}:${minutes}:${seconds}`, complete: milliseconds === 0 }
}
