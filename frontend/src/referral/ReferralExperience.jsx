import { useCallback, useEffect, useState } from 'react'
import { StatusScene } from '../components/StatusScene'
import { SoundControl } from '../components/SoundControl'
import { useBackgroundMusic } from '../hooks/useBackgroundMusic'
import { api } from '../services/api'
import { ReferralNarrativeScene } from './ReferralNarrativeScene'
import './ReferralExperience.css'

const MUSIC_SCENES = [0, 2, 5, 8, 12]

export function ReferralExperience({ code }) {
  const normalizedCode = code.toUpperCase()
  const [validation, setValidation] = useState({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    if (!/^EMR-[A-F0-9]{8}$/.test(normalizedCode)) {
      const timer = window.setTimeout(() => setValidation({ status: 'invalid' }), 0)
      return () => window.clearTimeout(timer)
    }
    api.getPublicReferral(normalizedCode)
      .then((data) => {
        if (active) setValidation(data.valido && data.codigoReferido === normalizedCode ? { status: 'ready' } : { status: 'invalid' })
      })
      .catch((error) => {
        if (active) setValidation({ status: error.status === 400 || error.status === 404 ? 'invalid' : 'error' })
      })
    return () => { active = false }
  }, [normalizedCode, attempt])

  const retry = () => {
    setValidation({ status: 'loading' })
    setAttempt((current) => current + 1)
  }

  if (validation.status === 'loading') return <StatusScene title="ENTRANDO A EMR" message="Tu invitación está abriendo el camino…" />
  if (validation.status === 'invalid') return <StatusScene title="INVITACIÓN NO DISPONIBLE" message="Esta invitación EMR no está disponible. Revisa el enlace que recibiste." />
  if (validation.status === 'error') return <StatusScene title="NO PUDIMOS ABRIR TU INVITACIÓN" message="Revisa tu conexión e inténtalo nuevamente." onRetry={retry} />
  return <ValidatedReferralExperience code={normalizedCode} />
}

function ValidatedReferralExperience({ code }) {
  const [scene, setScene] = useState(0)
  const music = useBackgroundMusic(MUSIC_SCENES[scene])
  const next = useCallback(() => setScene((current) => Math.min(4, current + 1)), [])
  const begin = () => {
    void music.start()
    next()
  }

  return (
    <div className="experience referral-experience" data-stage="RENACER">
      <ReferralNarrativeScene key={scene} scene={scene} code={code} onContinue={scene === 0 ? begin : next} />
      <SoundControl visible={music.started} muted={music.muted} onToggle={music.toggleMute} />
    </div>
  )
}
