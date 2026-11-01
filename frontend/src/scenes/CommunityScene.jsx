import { BRAND } from '../config/brand'
import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import { useNarrativeSequence } from '../hooks/useNarrativeSequence'
import './NarrativeSequence.css'
import './CommunityScene.css'

const SOCIAL_ICONS = {
  tiktok: <path d="M16.6 2c.3 2.5 1.7 4 4.4 4.2v3.4a9 9 0 0 1-4.4-1.3v7.2a6.5 6.5 0 1 1-5.6-6.4v3.5a3.1 3.1 0 1 0 2.1 2.9V2z" />,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.6" cy="6.5" r="1.2" /></>,
  facebook: <path d="M14 22v-9h3l.5-3.5H14V7.3c0-1 .3-1.8 1.8-1.8H18V2.3c-.4-.1-1.7-.3-3-.3-3 0-5 1.8-5 5.2v2.3H7V13h3v9z" />,
}

const STEPS = [
  { text: 'EL CAMINO NO TERMINA AQUÍ.', characterMs: 75 },
  { text: 'Forma parte del movimiento.', characterMs: 100 },
  { text: 'Continúa fortaleciendo tu mentalidad.' },
  { pauseMs: 1800 },
  { pauseMs: 1600 },
]

export function CommunityScene({ onContinue }) {
  const sequence = useNarrativeSequence(STEPS)
  return (
    <SceneFrame className="scene--community">
      <span className="eyebrow narrative-typed" data-text={STEPS[0].text} aria-label={STEPS[0].text}><span aria-hidden="true">{sequence.text(0)}</span></span>
      <h1 className="narrative-typed" data-text={STEPS[1].text} aria-label={STEPS[1].text}><span aria-hidden="true">{sequence.text(1)}</span></h1>
        <p className="narrative-typed" data-text={STEPS[2].text} aria-label={STEPS[2].text}><span aria-hidden="true">{sequence.text(2)}</span></p>
        <div className={`social-links ${sequence.visible(3) ? 'narrative-block-enter' : 'narrative-hidden'}`}>
          {Object.entries(BRAND.socials).map(([name, url]) => url ? (
            <a href={url} target="_blank" rel="noreferrer" key={name}>{name}<svg className="community-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">{SOCIAL_ICONS[name]}</svg></a>
          ) : (
            <span className="social-link--pending" title="URL oficial pendiente" key={name}>{name}<small>PRÓXIMAMENTE</small></span>
          ))}
        </div>
        <div className={sequence.visible(4) ? 'narrative-button-enter' : 'narrative-hidden'}><ContinueButton onClick={onContinue} disabled={!sequence.visible(4)} /></div>
    </SceneFrame>
  )
}
