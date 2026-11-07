import { useEffect, useState } from 'react'
import { ContinueButton, SceneFrame } from '../components/SceneFrame'
import logoAnimation from '../assets/images/emr_logo_reconstruction_transparent.gif'
import './IntroScene.css'

const FIRST_LINE = 'No todos llegan hasta aquí.'
const SECOND_LINE = 'Tú sí.'
const LOGO_ANIMATION_MS = 3100
const AFTER_LOGO_PAUSE_MS = 100
const FIRST_CHARACTER_MS = 90
const BETWEEN_LINES_MS = 800
const SECOND_CHARACTER_MS = 120
const BUTTON_PAUSE_MS = 900

export function IntroScene({ onContinue }) {
  const [animationReady, setAnimationReady] = useState(false)
  const [firstLength, setFirstLength] = useState(0)
  const [secondLength, setSecondLength] = useState(0)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    if (!animationReady) return undefined

    const timers = new Set()
    const schedule = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        callback()
      }, delay)
      timers.add(timer)
    }
    const typeLine = (text, setLength, interval, onComplete) => {
      let length = 0
      const typeNext = () => {
        length += 1
        setLength(length)
        if (length < text.length) schedule(typeNext, interval)
        else onComplete()
      }
      schedule(typeNext, interval)
    }

    schedule(() => {
      typeLine(FIRST_LINE, setFirstLength, FIRST_CHARACTER_MS, () => {
        schedule(() => {
          typeLine(SECOND_LINE, setSecondLength, SECOND_CHARACTER_MS, () => {
            schedule(() => setShowButton(true), BUTTON_PAUSE_MS)
          })
        }, BETWEEN_LINES_MS)
      })
    }, LOGO_ANIMATION_MS + AFTER_LOGO_PAUSE_MS)

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [animationReady])

  const typingFirst = firstLength > 0 && firstLength < FIRST_LINE.length
  const typingSecond = secondLength > 0 && secondLength < SECOND_LINE.length

  return (
    <SceneFrame className="scene--intro">
      <div className="intro-logo-block">
        <img
          className="intro-logo-image"
          src={logoAnimation}
          alt="ELMACHORENACE"
          onLoad={() => setAnimationReady(true)}
          onError={() => setAnimationReady(true)}
        />
      </div>

      <p className="intro-text-block" aria-label={`${FIRST_LINE} ${SECOND_LINE}`}>
        <span className="intro-typewriter__line">
          <span aria-hidden="true">{FIRST_LINE.slice(0, firstLength)}</span>
          {typingFirst && <i className="intro-caret" aria-hidden="true" />}
        </span>
        <span className="intro-typewriter__line intro-typewriter__line--strong">
          <strong aria-hidden="true">{SECOND_LINE.slice(0, secondLength)}</strong>
          {typingSecond && <i className="intro-caret" aria-hidden="true" />}
        </span>
      </p>

      <div className="intro-button-block">
        {showButton && <div className="intro-button-enter"><ContinueButton onClick={onContinue} /></div>}
      </div>
    </SceneFrame>
  )
}
