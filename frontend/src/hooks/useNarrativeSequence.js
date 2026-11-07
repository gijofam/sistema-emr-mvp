import { useEffect, useState } from 'react'

export function useNarrativeSequence(steps, { enabled = true, startDelayMs = 400 } = {}) {
  const [progress, setProgress] = useState({ block: -1, length: 0 })
  useEffect(() => {
    if (!enabled) return undefined
    let timer
    const schedule = (callback, delay) => { timer = window.setTimeout(callback, delay) }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      schedule(() => setProgress({ block: steps.length, length: 0 }), 0)
    } else {
      let block = 0
      let length = 0
      const advance = () => {
        block += 1
        length = 0
        if (block < steps.length) start()
        else setProgress({ block, length })
      }
      const typeNext = () => {
        length += 1
        setProgress({ block, length })
        if (length < steps[block].text.length) schedule(typeNext, steps[block].characterMs ?? 80)
        else schedule(advance, steps[block].pauseMs ?? 900)
      }
      const start = () => {
        setProgress({ block, length })
        if (steps[block].text) schedule(typeNext, steps[block].characterMs ?? 80)
        else schedule(advance, steps[block].pauseMs ?? 1600)
      }
      schedule(start, startDelayMs)
    }
    return () => window.clearTimeout(timer)
  }, [steps, enabled, startDelayMs])
  return {
    text: (index) => progress.block > index ? steps[index].text : progress.block === index ? (steps[index].text || '').slice(0, progress.length) : '',
    visible: (index) => progress.block >= index,
  }
}
