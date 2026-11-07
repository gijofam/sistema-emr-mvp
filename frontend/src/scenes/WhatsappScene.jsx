import { useEffect, useRef, useState } from 'react'
import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import { useNarrativeSequence } from '../hooks/useNarrativeSequence'
import { api } from '../services/api'
import './NarrativeSequence.css'

const STEPS = [
  { text: 'CONSERVA TU CAMINO', characterMs: 75 },
  { text: '¿Quieres conservar el progreso de tu prenda?', characterMs: 100 },
  { text: 'Registra tu número y podremos reconocerte cuando regreses, además de avisarte sobre nuevos lanzamientos y experiencias EMR.' },
  { pauseMs: 1200 },
  { pauseMs: 1800 },
  { pauseMs: 1600 },
]
const DEMO_STEPS = STEPS.map((step, index) => index === 2
  ? { ...step, text: 'Esta es una demostración. Tu número no se guardará; puedes continuar sin ingresarlo.' }
  : step)

export function WhatsappScene({ token, demo = false, onContinue }) {
  const steps = demo ? DEMO_STEPS : STEPS
  const sequence = useNarrativeSequence(steps)
  const [numero, setNumero] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const continueTimer = useRef(null)
  useEffect(() => () => window.clearTimeout(continueTimer.current), [])
  const submit = async (event) => {
    event.preventDefault()
    if (!sequence.visible(4) || status === 'saving' || status === 'saved') return
    if (!/^\+?[\d\s()-]{8,22}$/.test(numero.trim())) {
      setMessage('Ingresa un número válido con código de país.')
      return
    }
    setStatus('saving')
    try {
      if (!demo) await api.saveWhatsapp(token, numero)
      setStatus('saved')
      setMessage(demo ? 'Demostración: no se guardó tu número.' : 'Tu progreso quedó vinculado a este número.')
      continueTimer.current = window.setTimeout(onContinue, 4000)
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  return (
    <SceneFrame className="scene--whatsapp">
      <span className="eyebrow narrative-typed" data-text={steps[0].text} aria-label={steps[0].text}><span aria-hidden="true">{sequence.text(0)}</span></span>
      <h1 className="narrative-typed" data-text={steps[1].text} aria-label={steps[1].text}><span aria-hidden="true">{sequence.text(1)}</span></h1>
        <p className="narrative-typed" data-text={steps[2].text} aria-label={steps[2].text}><span aria-hidden="true">{sequence.text(2)}</span></p>
        <form onSubmit={submit} noValidate>
          <div className={sequence.visible(3) ? 'whatsapp-fields narrative-block-enter' : 'whatsapp-fields narrative-hidden'}>
          <label htmlFor="whatsapp">Número de WhatsApp</label>
          <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="+51 999 999 999" value={numero} onChange={(event) => setNumero(event.target.value)} />
          </div>
          <div className={sequence.visible(4) ? 'narrative-button-enter' : 'narrative-hidden'}>
          <ContinueButton type="submit" disabled={!sequence.visible(4) || status === 'saving' || status === 'saved'}>{status === 'saving' ? 'GUARDANDO…' : 'GUARDAR MI PROGRESO'}</ContinueButton>
          </div>
        </form>
        <p className="feedback" role="status">{message}</p>
        {status !== 'saved' && <button className={`text-action ${sequence.visible(5) ? 'narrative-button-enter' : 'narrative-hidden'}`} type="button" disabled={!sequence.visible(5)} onClick={onContinue}>AHORA NO</button>}
    </SceneFrame>
  )
}
