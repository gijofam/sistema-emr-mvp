import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import { useNarrativeSequence } from '../hooks/useNarrativeSequence'
import { useCountdown } from '../hooks/useCountdown'
import './NarrativeSequence.css'

const QUIET_COPY = 'Porque un mensaje que vale la pena no se consume.\n'
const makeSteps = (completed) => [
  { text: completed ? 'RECORRIDO COMPLETADO' : 'ESTE FUE SOLO EL PRIMERO.', characterMs: 75 },
  { text: 'TU PRENDA EMR', characterMs: 100 },
  { pauseMs: 1400 },
  { text: completed ? 'Los tres mensajes ya forman parte de tu camino.' : 'Esta prenda contiene 3 mensajes EMR.\nEl siguiente estará disponible mañana.' },
  { pauseMs: completed ? 0 : 1600 },
  { text: completed ? '' : `${QUIET_COPY}Se aplica.`, pauseMs: 1000 },
  { pauseMs: 1600 },
]
const ACTIVE_STEPS = makeSteps(false)
const COMPLETED_STEPS = makeSteps(true)

export function ProgressScene({ data, onContinue }) {
  const countdown = useCountdown(data.nextAvailableAt, data.serverTime)
  const completed = data.mensajesDesbloqueados >= 3
  const steps = completed ? COMPLETED_STEPS : ACTIVE_STEPS
  const sequence = useNarrativeSequence(steps)
  return (
    <SceneFrame className="scene--progress">
      <span className="eyebrow narrative-typed" data-text={steps[0].text} aria-label={steps[0].text}><span aria-hidden="true">{sequence.text(0)}</span></span>
      <h1 className="narrative-typed" data-text={steps[1].text} aria-label={steps[1].text}><span aria-hidden="true">{sequence.text(1)}</span></h1>
        <div className={`message-progress ${sequence.visible(2) ? 'narrative-block-enter' : 'narrative-hidden'}`}>
          {[1, 2, 3].map((number) => (
            <div className={number <= data.mensajesDesbloqueados ? 'is-unlocked' : ''} key={number}>
              <span>Mensaje {number}</span><b>{number <= data.mensajesDesbloqueados ? '✓' : '⌁'}</b>
            </div>
          ))}
        </div>
        {completed ? (
          <p className="narrative-typed" data-text={steps[3].text} aria-label={steps[3].text}><span aria-hidden="true">{sequence.text(3)}</span></p>
        ) : (
          <>
            <p className="narrative-typed" data-text={steps[3].text} aria-label={steps[3].text}><span aria-hidden="true">{sequence.text(3)}</span></p>
            {data.nextAvailableAt && <time className={`countdown ${sequence.visible(4) ? 'narrative-block-enter' : 'narrative-hidden'}`} dateTime={data.nextAvailableAt}>{countdown.label}</time>}
            <p className="quiet-copy narrative-typed" data-text={steps[5].text} aria-label={steps[5].text}><span aria-hidden="true">{sequence.text(5).slice(0, QUIET_COPY.length)}<strong>{sequence.text(5).slice(QUIET_COPY.length)}</strong></span></p>
          </>
        )}
        <div className={sequence.visible(6) ? 'narrative-button-enter' : 'narrative-hidden'}><ContinueButton onClick={onContinue} disabled={!sequence.visible(6)} /></div>
    </SceneFrame>
  )
}
