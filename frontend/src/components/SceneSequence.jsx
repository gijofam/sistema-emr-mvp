import { useEffect, useRef, useState } from 'react'
import './SceneSequence.css'

const CHARACTER_MS = 55
const AFTER_PHRASE_MS = 500

export function SceneSequence({ text, as: Tag = 'h1', className = '', children, onReady, characterMs = CHARACTER_MS }) {
  const [length, setLength] = useState(0)
  const [ready, setReady] = useState(false)
  const onReadyRef = useRef(onReady)

  useEffect(() => { onReadyRef.current = onReady }, [onReady])

  useEffect(() => {
    const finish = () => { setReady(true); onReadyRef.current?.() }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const timer = window.setTimeout(() => { setLength(text.length); finish() }, 0)
      return () => window.clearTimeout(timer)
    }

    let count = 0
    let pauseTimer
    const typingTimer = window.setInterval(() => {
      count += 1
      setLength(count)
      if (count >= text.length) {
        window.clearInterval(typingTimer)
        pauseTimer = window.setTimeout(finish, AFTER_PHRASE_MS)
      }
    }, characterMs)

    return () => { window.clearInterval(typingTimer); window.clearTimeout(pauseTimer) }
  }, [text, characterMs])

  return (
    <>
      <Tag className={`scene-typed-text ${className}`} aria-label={text}>
        <span aria-hidden="true">{text.slice(0, length)}</span>
        {length > 0 && length < text.length && <i className="scene-typing-caret" aria-hidden="true" />}
      </Tag>
      {ready && children}
    </>
  )
}
