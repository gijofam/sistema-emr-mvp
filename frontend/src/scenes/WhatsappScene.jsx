import { useEffect, useRef, useState } from 'react'
import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import { SceneSequence } from '../components/SceneSequence'
import { api } from '../services/api'

export function WhatsappScene({ token, onContinue }) {
  const [numero, setNumero] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const continueTimer = useRef(null)
  useEffect(() => () => window.clearTimeout(continueTimer.current), [])
  const submit = async (event) => {
    event.preventDefault()
    if (status === 'saving' || status === 'saved') return
    if (!/^\+?[\d\s()-]{8,22}$/.test(numero.trim())) {
      setMessage('Ingresa un número válido con código de país.')
      return
    }
    setStatus('saving')
    try {
      await api.saveWhatsapp(token, numero)
      setStatus('saved')
      setMessage('Tu progreso quedó vinculado a este número.')
      continueTimer.current = window.setTimeout(onContinue, 850)
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  return (
    <SceneFrame className="scene--whatsapp">
      <span className="eyebrow">CONSERVA TU CAMINO</span>
      <SceneSequence text="¿Quieres conservar el progreso de tu prenda?">
        <p className="reveal">Registra tu número y podremos reconocerte cuando regreses, además de avisarte sobre nuevos lanzamientos y experiencias EMR.</p>
        <form className="reveal reveal--delay-1" onSubmit={submit} noValidate>
          <label htmlFor="whatsapp">Número de WhatsApp</label>
          <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="+51 999 999 999" value={numero} onChange={(event) => setNumero(event.target.value)} />
          <ContinueButton type="submit" disabled={status === 'saving' || status === 'saved'}>{status === 'saving' ? 'GUARDANDO…' : 'GUARDAR MI PROGRESO'}</ContinueButton>
        </form>
        <p className="feedback" role="status">{message}</p>
        {status !== 'saved' && <button className="text-action" type="button" onClick={onContinue}>AHORA NO</button>}
      </SceneSequence>
    </SceneFrame>
  )
}
