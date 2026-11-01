import { useEffect, useState } from 'react'
import { BrandMark } from '../components/BrandMark'
import { SceneFrame } from '../components/SceneFrame'

const phases = [
  <p key="one">Hoy recibiste un mensaje.<br /><strong>Mañana depende de lo que hagas con él.</strong></p>,
  <h1 key="two">EL RENACER COMIENZA<br />CUANDO DECIDES NO RENDIRTE.</h1>,
  <div className="closing-letter" key="three"><p>No importa cuántas veces hayas caído.</p><p>Lo que realmente importa es la decisión<br />de volver a levantarte.</p><p>Cada día es una nueva oportunidad para construir,<br />con disciplina, carácter y propósito,<br />la persona que quieres llegar a ser.</p><p>Gracias por permitir que EMR forme parte<br />de ese camino.</p><p>Nos honra acompañarte<br />desde el primer paso.</p></div>,
  <div className="closing-mark" key="four"><BrandMark /><p>ELMACHORENACE</p><span>FIN.</span></div>,
]

export function ClosingScene() {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (phase >= phases.length - 1) return undefined
    const duration = phase === 2 ? 8500 : 4200
    const timer = window.setTimeout(() => setPhase((value) => value + 1), duration)
    return () => window.clearTimeout(timer)
  }, [phase])
  return (
    <SceneFrame className="scene--closing" onClick={() => setPhase((value) => Math.min(phases.length - 1, value + 1))} ariaLabel="Cierre EMR. Toca para continuar.">
      <div className="closing-phase" key={phase}>{phases[phase]}</div>
      {phase < phases.length - 1 && <span className="tap-hint">TOCA PARA CONTINUAR</span>}
    </SceneFrame>
  )
}
