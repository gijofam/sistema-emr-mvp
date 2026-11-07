import { useState } from 'react'
import { BRAND } from '../config/brand'
import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import { useNarrativeSequence } from '../hooks/useNarrativeSequence'
import logoAnimation from '../assets/images/emr_logo_reconstruction_transparent.gif'
import '../scenes/IntroScene.css'
import '../scenes/NarrativeSequence.css'

const SCENES = [
  [
    { pauseMs: 100 },
    { text: 'ALGUIEN PENSÓ QUE DEBÍAS VER ESTO.', characterMs: 90, pauseMs: 1200 },
  ],
  [
    { text: 'Quizá estás atravesando un quiebre.', characterMs: 85, pauseMs: 1000, emphasis: 'quiebre' },
    { text: 'Quizá estás empezando a renacer.', characterMs: 85, pauseMs: 1000, emphasis: 'renacer' },
    { text: 'O quizá ya decidiste evolucionar.', characterMs: 85, pauseMs: 1200, emphasis: 'evolucionar' },
  ],
  [
    { text: 'EMR no nació para venderte una prenda.', characterMs: 100, pauseMs: 1200 },
    { text: 'Nació para representar la persona\nque estás decidido a convertirte.', characterMs: 90, pauseMs: 1200 },
  ],
  [
    { text: 'No estás empezando de cero.', characterMs: 100, pauseMs: 1800 },
    { text: 'Estás empezando desde todo lo que sobreviviste.', characterMs: 100, pauseMs: 1400 },
  ],
  [
    { text: 'TU CAMINO PUEDE COMENZAR AQUÍ.', characterMs: 100, pauseMs: 1200 },
    { pauseMs: 1800 },
    { pauseMs: 1600 },
  ],
]

function emphasizedText(text, word) {
  if (!word) return text
  const start = text.indexOf(word)
  if (start < 0) return text
  return <>{text.slice(0, start)}<strong>{text.slice(start, start + word.length)}</strong>{text.slice(start + word.length)}</>
}

export function ReferralNarrativeScene({ scene, code, onContinue }) {
  const steps = SCENES[scene]
  const [logoReady, setLogoReady] = useState(false)
  const sequence = useNarrativeSequence(steps, {
    enabled: scene !== 0 || logoReady,
    startDelayMs: scene === 0 ? 3100 : 400,
  })
  const ready = sequence.visible(steps.length)
  const salesNumber = BRAND.whatsappSales.replace(/\D/g, '')
  const salesMessage = `Hola, conocí EMR a través de una invitación y quiero información para conseguir mi prenda. Mi código de invitación es ${code}.`
  const salesUrl = salesNumber ? `https://wa.me/${salesNumber}?text=${encodeURIComponent(salesMessage)}` : null

  return (
    <SceneFrame className={`scene--guest scene--guest-${scene + 1}`}>
      {scene === 0 && (
        <div className="guest-logo intro-logo-block">
          <img
            className="intro-logo-image"
            src={logoAnimation}
            alt="ELMACHORENACE"
            onLoad={() => setLogoReady(true)}
            onError={() => setLogoReady(true)}
          />
        </div>
      )}
      {steps.map((step, index) => {
        if (!step.text) return null
        const Tag = index === 0 || (scene === 0 && index === 1) ? 'h1' : 'p'
        return (
          <Tag className="narrative-typed guest-copy" data-text={step.text} aria-label={step.text} key={index}>
            <span aria-hidden="true">{emphasizedText(sequence.text(index), step.emphasis)}</span>
          </Tag>
        )
      })}
      {scene < 4 ? (
        <div className={ready ? 'narrative-button-enter' : 'narrative-hidden'}>
          <ContinueButton onClick={onContinue} disabled={!ready} />
        </div>
      ) : (
        <div className="action-group guest-actions">
          <div className={sequence.visible(1) ? 'narrative-button-enter' : 'narrative-hidden'}>
            <a className="action guest-link" href={BRAND.socials.tiktok} target="_blank" rel="noreferrer">CONOCER EMR</a>
          </div>
          <div className={sequence.visible(2) ? 'narrative-button-enter' : 'narrative-hidden'}>
            {salesUrl ? (
              <a className="action action--secondary guest-link" href={salesUrl} target="_blank" rel="noreferrer">QUIERO MI PRENDA</a>
            ) : (
              <><ContinueButton secondary disabled>QUIERO MI PRENDA</ContinueButton><p className="guest-sales-pending">Contacto de EMR próximamente.</p></>
            )}
          </div>
        </div>
      )}
    </SceneFrame>
  )
}
