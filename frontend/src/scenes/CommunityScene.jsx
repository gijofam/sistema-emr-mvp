import { BRAND } from '../config/brand'
import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import { SceneSequence } from '../components/SceneSequence'

export function CommunityScene({ onContinue }) {
  return (
    <SceneFrame className="scene--community">
      <span className="eyebrow">EL CAMINO NO TERMINA AQUÍ.</span>
      <SceneSequence text="Forma parte del movimiento.">
        <p className="reveal">Continúa fortaleciendo tu mentalidad.</p>
        <div className="social-links reveal reveal--delay-1">
          {Object.entries(BRAND.socials).map(([name, url]) => url ? (
            <a href={url} target="_blank" rel="noreferrer" key={name}>{name}</a>
          ) : (
            <span className="social-link--pending" title="URL oficial pendiente" key={name}>{name}<small>PRÓXIMAMENTE</small></span>
          ))}
        </div>
        <div className="reveal reveal--delay-2"><ContinueButton onClick={onContinue} /></div>
      </SceneSequence>
    </SceneFrame>
  )
}
