import { useEffect, useState } from 'react'
import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import './MessageScene.css'

const SIGNATURE = '@ELMACHORENACE'

export function MessageScene({ message, onContinue }) {
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState({ block: 0, length: 0 })
  const heading = `TU MENSAJE #${String(message.codigo).padStart(3, '0')}`

  useEffect(() => {
    const copy = [heading, message.texto, SIGNATURE]
    let timer
    const schedule = (callback, delay) => { timer = window.setTimeout(callback, delay) }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      schedule(() => {
        setProgress({ block: copy.length, length: 0 })
        setReady(true)
      }, 0)
    } else {
      let block = 0
      let length = 0
      const step = () => {
        length += 1
        setProgress({ block, length })
        if (length < copy[block].length) schedule(step, 80)
        else schedule(() => {
          block += 1
          length = 0
          setProgress({ block, length })
          if (block < copy.length) schedule(step, 80)
          else schedule(() => setReady(true), 2500)
        }, block === 1 ? 1200 : 700)
      }
      schedule(step, 400)
    }
    return () => window.clearTimeout(timer)
  }, [heading, message.texto])

  const typed = (text, index) => (
    <>
      <span className="message-copy__space" aria-hidden="true">{text}</span>
      <span className="message-copy__visible" aria-hidden="true">
        {progress.block > index ? text : progress.block === index ? text.slice(0, progress.length) : ''}
      </span>
    </>
  )

  return (
    <SceneFrame className="scene--message">
      <span className="eyebrow message-copy" aria-label={heading}>{typed(heading, 0)}</span>
      <blockquote className="message-quote message-copy" aria-label={message.texto}>{typed(message.texto, 1)}</blockquote>
      <span className={`signature message-copy message-signature ${progress.block >= 3 ? 'message-signature--shine' : ''}`} aria-label={SIGNATURE}>
        {typed(SIGNATURE, 2)}
      </span>
      <div className={`message-action ${ready ? 'message-action--ready' : ''}`}>
        <ContinueButton onClick={onContinue} disabled={!ready} />
      </div>
    </SceneFrame>
  )
}
