import { useEffect, useState } from 'react'
import { SceneFrame } from '../components/SceneFrame'
import { SceneSequence } from '../components/SceneSequence'

export function ExpectationScene({ unlock, onComplete, onError }) {
  const [phase, setPhase] = useState(0)
  const [firstReady, setFirstReady] = useState(false)
  const [secondReady, setSecondReady] = useState(false)

  useEffect(() => {
    if (!firstReady) return undefined
    const timer = window.setTimeout(() => setPhase(1), 1250)
    return () => window.clearTimeout(timer)
  }, [firstReady])

  useEffect(() => {
    if (!secondReady) return undefined
    let active = true
    let timer
    const reveal = async () => {
      try {
        const result = await unlock()
        if (active) timer = window.setTimeout(() => onComplete(result), 1250)
      } catch (error) {
        if (active) onError(error)
      }
    }
    reveal()
    return () => { active = false; window.clearTimeout(timer) }
  }, [secondReady, onComplete, onError, unlock])

  return (
    <SceneFrame className="scene--expectation">
      {phase === 0 ? (
        <SceneSequence key="chosen" as="p" className="expectation is-visible" text="EMR ELIGIÓ ESTE MENSAJE PARA TI" characterMs={85} onReady={() => setFirstReady(true)}>
          <div className="pulse-mark" aria-hidden="true" />
        </SceneSequence>
      ) : (
        <SceneSequence key="revealing" as="p" className="expectation expectation--second is-visible" text={'EMR ESTÁ REVELANDO\nTU MENSAJE...'} characterMs={85} onReady={() => setSecondReady(true)}>
          <div className="pulse-mark" aria-hidden="true" />
        </SceneSequence>
      )}
    </SceneFrame>
  )
}
