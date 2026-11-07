import { useEffect, useState } from 'react'
import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import { BRAND } from '../config/brand'
import { api } from '../services/api'
import './ReferralScene.css'

const COPY = [
  'Alguien más podría necesitar comenzar.',
  'Si alguien inicia su camino en EMR gracias a ti,\ncomenzaremos a registrar tu impacto.',
  'PERSONAS QUE COMENZARON\nGRACIAS A TI',
  'RECOMPENSA SECRETA',
]
const DEMO_COPY = COPY.map((text, index) => index === 1
  ? 'Comparte esta demostración para pedir una opinión.\nLas visitas no se registran como referidos.'
  : text)

export function ReferralScene({ token, demo = false, onContinue }) {
  const copy = demo ? DEMO_COPY : COPY
  const [referral, setReferral] = useState({ personasIniciadas: 0, objetivo: 5, codigoReferido: null })
  const [feedback, setFeedback] = useState('')
  const [manualUrl, setManualUrl] = useState('')
  const [inviting, setInviting] = useState(false)
  const [progress, setProgress] = useState({ block: 0, length: 0 })
  useEffect(() => {
    if (demo) return undefined
    let active = true
    api.getReferral(token).then((data) => { if (active) setReferral(data) }).catch(() => {})
    return () => { active = false }
  }, [token, demo])

  useEffect(() => {
    let timer
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer = window.setTimeout(() => setProgress({ block: copy.length, length: 0 }), 0)
    } else {
      let block = 0
      let length = 0
      const step = () => {
        length += 1
        setProgress({ block, length })
        if (length < copy[block].length) {
          timer = window.setTimeout(step, block === 0 ? 100 : 80)
        } else {
          timer = window.setTimeout(() => {
            block += 1
            length = 0
            setProgress({ block, length })
            if (block < copy.length) timer = window.setTimeout(step, block === 1 ? 1800 : block === 3 ? 1200 : 80)
          }, 900)
        }
      }
      timer = window.setTimeout(step, 400)
    }
    return () => window.clearTimeout(timer)
  }, [copy])

  const typed = (index) => (
    <>
      <span className="referral-copy__space" aria-hidden="true">{copy[index]}</span>
      <span className="referral-copy__visible" aria-hidden="true">
        {progress.block > index ? copy[index] : progress.block === index ? copy[index].slice(0, progress.length) : ''}
      </span>
    </>
  )

  const invite = async () => {
    if (inviting) return
    setInviting(true)
    setFeedback('')
    setManualUrl('')
    try {
      const result = demo ? null : await api.createReferral(token)
      if (result) setReferral(result)
      const siteUrl = import.meta.env.DEV ? window.location.origin : BRAND.siteUrl
      const url = new URL(demo ? '/demo' : `/r/${encodeURIComponent(result.codigoReferido)}`, siteUrl).href
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Comienza tu camino EMR', text: 'Alguien más podría necesitar comenzar.', url })
          return
        } catch (error) {
          if (error?.name === 'AbortError') return
        }
      }
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(url)
          setFeedback('Enlace de invitación copiado.')
          return
        } catch { /* Si el navegador bloquea la copia, ofrecer selección manual. */ }
      }
      setManualUrl(url)
      setFeedback('Mantén pulsado el enlace para copiarlo y compartirlo.')
    } catch (error) {
      if (error?.name !== 'AbortError') setFeedback('No pudimos preparar la invitación. Inténtalo nuevamente.')
    } finally {
      setInviting(false)
    }
  }

  const percent = Math.min(100, (referral.personasIniciadas / referral.objetivo) * 100)
  return (
    <SceneFrame className="scene--referral">
      <h1 className="referral-copy" aria-label={copy[0]}>{typed(0)}</h1>
        <div className={`referral-enter ${progress.block >= 1 ? 'referral-enter--visible' : ''}`}>
          <ContinueButton onClick={invite} disabled={progress.block < 1 || inviting}>INVITAR A ALGUIEN</ContinueButton>
        </div>
        <p className="referral-copy" aria-label={copy[1]}>{typed(1)}</p>
        <span className="eyebrow referral-copy" aria-label={copy[2]}>{typed(2)}</span>
        <div className={`impact-bar referral-metrics ${progress.block >= 3 ? 'referral-metrics--visible' : ''}`} aria-label={`${referral.personasIniciadas} de ${referral.objetivo}`}><i style={{ width: `${percent}%` }} /></div>
        <strong className={`impact-count referral-metrics ${progress.block >= 3 ? 'referral-metrics--visible' : ''}`}>{referral.personasIniciadas} / {referral.objetivo}</strong>
        <p className="reward referral-copy" aria-label={copy[3]}>{typed(3)}</p>
        <p className="feedback" role="status">{feedback}</p>
        {manualUrl && <input className="referral-manual-link" aria-label="Enlace de invitación para copiar" value={manualUrl} readOnly onFocus={(event) => event.target.select()} />}
        <button className={`text-action referral-enter ${progress.block >= copy.length ? 'referral-enter--visible' : ''}`} type="button" disabled={progress.block < copy.length} onClick={onContinue}>CONTINUAR</button>
    </SceneFrame>
  )
}
