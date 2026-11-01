import { useEffect, useState } from 'react'
import { BrandMark } from '../components/BrandMark'
import { SceneFrame } from '../components/SceneFrame'
import { useNarrativeSequence } from '../hooks/useNarrativeSequence'
import './NarrativeSequence.css'
import './ClosingScene.css'

const PHASES = [
  [
    { text: 'Hoy recibiste un mensaje.', pauseMs: 500 },
    { text: 'Mañana depende de lo que hagas con él.' },
  ],
  [{ text: 'EL RENACER COMIENZA\nCUANDO DECIDES NO RENDIRTE.', characterMs: 100 }],
  [
    { text: 'No importa cuántas veces hayas caído.' },
    { text: 'Lo que realmente importa es la decisión\nde volver a levantarte.' },
    { text: 'Cada día es una nueva oportunidad para construir,\ncon disciplina, carácter y propósito,\nla persona que quieres llegar a ser.' },
    { text: 'Gracias por permitir que EMR forme parte\nde ese camino.' },
    { text: 'Nos honra acompañarte\ndesde el primer paso.' },
  ],
]

function ClosingPart({ phase, onContinue }) {
  const steps = PHASES[phase]
  const sequence = useNarrativeSequence(steps)
  const ready = sequence.visible(steps.length)
  useEffect(() => {
    if (!ready) return undefined
    const duration = phase === 2 ? 8500 : 4200
    const timer = window.setTimeout(onContinue, duration)
    return () => window.clearTimeout(timer)
  }, [phase, ready, onContinue])

  const typed = (index) => (
    <span className="closing-typed" data-text={steps[index].text} aria-label={steps[index].text}>
      <span aria-hidden="true">{sequence.text(index)}</span>
    </span>
  )
  return (
    <SceneFrame className="scene--closing" onClick={ready ? onContinue : undefined} ariaLabel="Cierre EMR">
      <div className="closing-phase">
        {phase === 0 && <p>{typed(0)}<strong>{typed(1)}</strong></p>}
        {phase === 1 && <h1>{typed(0)}</h1>}
        {phase === 2 && <div className="closing-letter">{steps.map((step, index) => <p key={step.text}>{typed(index)}</p>)}</div>}
      </div>
      {ready && <button className="tap-hint closing-tap-hint narrative-button-enter" type="button" onClick={(event) => { event.stopPropagation(); onContinue() }}>TOCA PARA CONTINUAR</button>}
    </SceneFrame>
  )
}

export function ClosingScene() {
  const [phase, setPhase] = useState(0)
  if (phase < PHASES.length) return <ClosingPart key={phase} phase={phase} onContinue={() => setPhase((current) => Math.min(PHASES.length, current + 1))} />
  return (
    <SceneFrame className="scene--closing" ariaLabel="Fin de la experiencia EMR">
      <div className="closing-phase closing-mark"><BrandMark /><p>ELMACHORENACE</p><span>FIN.</span></div>
    </SceneFrame>
  )
}
