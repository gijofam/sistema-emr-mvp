import { useCallback, useState } from 'react'
import './App.css'
import { SoundControl } from './components/SoundControl'
import { StatusScene } from './components/StatusScene'
import { useBackgroundMusic } from './hooks/useBackgroundMusic'
import { useExperience } from './hooks/useExperience'
import { ClosingScene } from './scenes/ClosingScene'
import { CommunityScene } from './scenes/CommunityScene'
import { DecisionScene } from './scenes/DecisionScene'
import { ExpectationScene } from './scenes/ExpectationScene'
import { GenerationScene } from './scenes/GenerationScene'
import { IntroScene } from './scenes/IntroScene'
import { MessageScene } from './scenes/MessageScene'
import { PhilosophyScene } from './scenes/PhilosophyScene'
import { ProgressScene } from './scenes/ProgressScene'
import { ReflectionScene } from './scenes/ReflectionScene'
import { ReferralScene } from './scenes/ReferralScene'
import { ShareScene } from './scenes/ShareScene'
import { WhatsappScene } from './scenes/WhatsappScene'
import { ReferralExperience } from './referral/ReferralExperience'

const readToken = () => {
  const match = window.location.pathname.match(/^\/c\/([A-Za-z0-9](?:[A-Za-z0-9-]{4,30}[A-Za-z0-9]))\/?$/)
  return match?.[1]?.toUpperCase() || null
}

function GarmentExperience() {
  const [token] = useState(() => readToken())
  const experience = useExperience(token)
  const [scene, setScene] = useState(0)
  const [message, setMessage] = useState(null)
  const [sceneError, setSceneError] = useState(null)
  const { started: musicStarted, muted, start: startMusic, toggleMute } = useBackgroundMusic(scene)
  const next = useCallback(() => setScene((current) => current + 1), [])
  const beginExperience = useCallback(() => {
    void startMusic()
    next()
  }, [next, startMusic])
  const completeReveal = useCallback((result) => {
    const revealed = result.mensaje || result.mensajes?.at(-1)
    if (!revealed) {
      setSceneError({ message: 'Esta prenda aún no tiene un mensaje disponible.' })
      return
    }
    setMessage(revealed)
    setScene(4)
  }, [])

  if (experience.status === 'loading') {
    return <StatusScene title="ENTRANDO A EMR" message="Tu prenda está abriendo el camino…" />
  }
  if (experience.status === 'error') {
    const inactive = experience.error?.code === 'PRENDA_INACTIVA'
    return <StatusScene title={inactive ? 'PRENDA INACTIVA' : 'ESTE CÓDIGO NO PERTENECE A UNA PRENDA EMR ACTIVA.'} message={experience.error?.message} onRetry={experience.reload} />
  }
  if (sceneError) {
    return <StatusScene title="EL MENSAJE SIGUE AHÍ." message={sceneError.message} onRetry={() => { setSceneError(null); setScene(2) }} />
  }

  const scenes = [
    <IntroScene onContinue={beginExperience} />,
    <GenerationScene onContinue={next} />,
    <PhilosophyScene onContinue={next} />,
    <ExpectationScene unlock={experience.unlock} onComplete={completeReveal} onError={setSceneError} />,
    message && <MessageScene message={message} onContinue={next} />,
    <DecisionScene onContinue={next} />,
    <ReflectionScene onContinue={next} />,
    message && <ShareScene message={message} onContinue={next} />,
    <ProgressScene data={experience.data} onContinue={next} />,
    <WhatsappScene token={token} onContinue={next} />,
    <CommunityScene onContinue={next} />,
    <ReferralScene token={token} onContinue={next} />,
    <ClosingScene />,
  ]

  return (
    <div className="experience" data-stage={experience.data.etapaEmr}>
      {scenes[scene] || scenes.at(-1)}
      <SoundControl visible={musicStarted} muted={muted} onToggle={toggleMute} />
    </div>
  )
}

export default function App() {
  const pathname = window.location.pathname
  if (pathname === '/r' || pathname.startsWith('/r/')) {
    const match = pathname.match(/^\/r\/([^/]+)\/?$/)
    return <ReferralExperience code={match?.[1] || ''} />
  }
  return <GarmentExperience />
}
