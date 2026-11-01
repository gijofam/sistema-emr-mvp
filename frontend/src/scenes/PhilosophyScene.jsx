import { useEffect, useState } from 'react'
import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import './PhilosophyScene.css'

const COPY = [
  'No compraste solamente una prenda.',
  'Elegiste representar algo.',
  'Tu camino EMR comienza aquí.',
]
const CHARACTER_MS = [80, 100, 80]
const STAGE_CYCLE_MS = 9000

export function PhilosophyScene({ onContinue }) {
  const [lengths, setLengths] = useState([0, 0, 0])
  const [showStages, setShowStages] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let timer
    const schedule = (callback, delay) => {
      timer = window.setTimeout(callback, delay)
    }
    const type = (index, onComplete) => {
      let length = 0
      const step = () => {
        length += 1
        setLengths((current) => current.map((value, i) => i === index ? length : value))
        if (length < COPY[index].length) schedule(step, CHARACTER_MS[index])
        else onComplete()
      }
      schedule(step, CHARACTER_MS[index])
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      schedule(() => {
        setLengths(COPY.map((text) => text.length))
        setShowStages(true)
        setReady(true)
      }, 0)
    } else {
      schedule(() => type(0, () => {
        schedule(() => type(1, () => {
          schedule(() => {
            setShowStages(true)
            schedule(() => type(2, () => {
              schedule(() => setReady(true), 1000)
            }), STAGE_CYCLE_MS)
          }, 1000)
        }), 800)
      }), 400)
    }
    return () => window.clearTimeout(timer)
  }, [])

  const typed = (index) => (
    <>
      <span className="philosophy-copy__space" aria-hidden="true">{COPY[index]}</span>
      <span className="philosophy-copy__visible" aria-hidden="true">{COPY[index].slice(0, lengths[index])}</span>
    </>
  )

  return (
    <SceneFrame className="scene--philosophy">
      <p className="philosophy-copy" aria-label={COPY[0]}>{typed(0)}</p>
      <h1 className="philosophy-copy" aria-label={COPY[1]}>{typed(1)}</h1>
      <div className={`philosophy-stages ${showStages ? 'philosophy-stages--playing' : ''}`} role="img" aria-label="Quiebre, renacer, evolución">
        <span aria-hidden="true">QUIEBRE.</span><span aria-hidden="true">RENACER.</span><span aria-hidden="true">EVOLUCIÓN.</span>
      </div>
      <p className="philosophy-copy" aria-label={COPY[2]}>{typed(2)}</p>
      <div className={`philosophy-action ${ready ? 'philosophy-action--ready' : ''}`}>
        <ContinueButton onClick={onContinue} disabled={!ready}>DESCUBRIR MI MENSAJE</ContinueButton>
      </div>
    </SceneFrame>
  )
}
