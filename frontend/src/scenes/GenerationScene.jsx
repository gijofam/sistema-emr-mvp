import { useEffect, useState } from 'react'
import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import './GenerationScene.css'

const COPY = [
  'BIENVENIDO A LA GENERACIÓN II',
  'Ahora formas parte de EMR.',
  'Hoy no comienza una compra.',
  'Comienza la decisión de convertirte\nen la mejor versión de ti mismo.',
]
const CHARACTER_MS = [75, 100, 80, 80]
const PAUSE_MS = [800, 1000, 800, 1000]

export function GenerationScene({ onContinue }) {
  const [progress, setProgress] = useState({ block: 0, length: 0 })

  useEffect(() => {
    let timer
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer = window.setTimeout(() => setProgress({ block: COPY.length, length: 0 }), 0)
    } else {
      let block = 0
      let length = 0
      const typeNext = () => {
        length += 1
        setProgress({ block, length })
        if (length < COPY[block].length) {
          timer = window.setTimeout(typeNext, CHARACTER_MS[block])
        } else {
          timer = window.setTimeout(() => {
            block += 1
            length = 0
            setProgress({ block, length })
            if (block < COPY.length) timer = window.setTimeout(typeNext, CHARACTER_MS[block])
          }, PAUSE_MS[block])
        }
      }
      timer = window.setTimeout(typeNext, 400)
    }
    return () => window.clearTimeout(timer)
  }, [])

  const typed = (index) => (
    <>
      <span className="generation-copy__space" aria-hidden="true">{COPY[index]}</span>
      <span className="generation-copy__visible" aria-hidden="true">
        {progress.block > index ? COPY[index] : progress.block === index ? COPY[index].slice(0, progress.length) : ''}
      </span>
    </>
  )
  const ready = progress.block >= COPY.length

  return (
    <SceneFrame className="scene--generation">
      <span className="eyebrow generation-copy" aria-label={COPY[0]}>{typed(0)}</span>
      <h1 className="generation-copy" aria-label={COPY[1]}>{typed(1)}</h1>
      <div className="narrative">
        <p className="generation-copy" aria-label={COPY[2]}>{typed(2)}</p>
        <p className="generation-copy" aria-label={COPY[3]}>{typed(3)}</p>
      </div>
      <div className={`generation-action ${ready ? 'generation-action--ready' : ''}`}>
        <ContinueButton onClick={onContinue} disabled={!ready} />
      </div>
    </SceneFrame>
  )
}
