import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import { SceneSequence } from '../components/SceneSequence'
import { useCountdown } from '../hooks/useCountdown'

export function ProgressScene({ data, onContinue }) {
  const countdown = useCountdown(data.nextAvailableAt, data.serverTime)
  const completed = data.mensajesDesbloqueados >= 3
  return (
    <SceneFrame className="scene--progress">
      <span className="eyebrow">{completed ? 'RECORRIDO COMPLETADO' : 'ESTE FUE SOLO EL PRIMERO.'}</span>
      <SceneSequence text="TU PRENDA EMR">
        <div className="message-progress reveal">
          {[1, 2, 3].map((number) => (
            <div className={number <= data.mensajesDesbloqueados ? 'is-unlocked' : ''} key={number}>
              <span>Mensaje {number}</span><b>{number <= data.mensajesDesbloqueados ? '✓' : '⌁'}</b>
            </div>
          ))}
        </div>
        {completed ? (
          <p className="narrative reveal reveal--delay-1">Los tres mensajes ya forman parte de tu camino.</p>
        ) : (
          <>
            <p className="reveal reveal--delay-1">Esta prenda contiene 3 mensajes EMR.<br />El siguiente estará disponible mañana.</p>
            {data.nextAvailableAt && <time className="countdown reveal reveal--delay-2" dateTime={data.nextAvailableAt}>{countdown.label}</time>}
            <p className="quiet-copy reveal reveal--delay-2">Porque un mensaje que vale la pena no se consume.<br /><strong>Se aplica.</strong></p>
          </>
        )}
        <div className="reveal reveal--delay-3"><ContinueButton onClick={onContinue} /></div>
      </SceneSequence>
    </SceneFrame>
  )
}
