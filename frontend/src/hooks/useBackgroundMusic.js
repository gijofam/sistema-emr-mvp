import { useCallback, useEffect, useRef, useState } from 'react'
import musicUrl from '../assets/audio/emr-experience.mp3'

const INITIAL_VOLUME = 0.08
const MAX_VOLUME = 0.42
const FADE_IN_MS = 4500
const SCENE_VOLUMES = [
  INITIAL_VOLUME,
  0.14,
  0.18,
  0.26,
  MAX_VOLUME,
  0.34,
  0.32,
  0.34,
  0.32,
  0.32,
  0.34,
  0.37,
  MAX_VOLUME,
]

const sceneVolume = (scene) => SCENE_VOLUMES[scene] ?? MAX_VOLUME

export function useBackgroundMusic(scene) {
  const audioRef = useRef(null)
  const fadeFrameRef = useRef(null)
  const fadeInUntilRef = useRef(0)
  const startedRef = useRef(false)
  const mutedRef = useRef(false)
  const targetVolumeRef = useRef(sceneVolume(scene))
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)

  const cancelFade = useCallback(() => {
    if (fadeFrameRef.current !== null) {
      cancelAnimationFrame(fadeFrameRef.current)
      fadeFrameRef.current = null
    }
  }, [])

  const fadeTo = useCallback((target, duration) => {
    const audio = audioRef.current
    if (!audio) return
    cancelFade()
    const from = audio.volume
    const safeTarget = Math.min(MAX_VOLUME, Math.max(0, target))
    const startedAt = performance.now()

    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const eased = 1 - ((1 - progress) ** 3)
      audio.volume = from + ((safeTarget - from) * eased)
      if (progress < 1) fadeFrameRef.current = requestAnimationFrame(step)
      else fadeFrameRef.current = null
    }

    fadeFrameRef.current = requestAnimationFrame(step)
  }, [cancelFade])

  useEffect(() => {
    const audio = new Audio(musicUrl)
    audio.preload = 'auto'
    audio.loop = true
    audio.volume = INITIAL_VOLUME
    audioRef.current = audio

    return () => {
      cancelFade()
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [cancelFade])

  useEffect(() => {
    targetVolumeRef.current = sceneVolume(scene)
    if (startedRef.current && !mutedRef.current) {
      const remainingFadeIn = Math.max(0, fadeInUntilRef.current - performance.now())
      fadeTo(targetVolumeRef.current, Math.max(1800, remainingFadeIn))
    }
  }, [fadeTo, scene])

  const start = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || (startedRef.current && !audio.paused)) return

    startedRef.current = true
    mutedRef.current = true
    setStarted(true)
    audio.volume = INITIAL_VOLUME

    try {
      await audio.play()
      mutedRef.current = false
      setMuted(false)
      fadeInUntilRef.current = performance.now() + FADE_IN_MS
      fadeTo(targetVolumeRef.current, FADE_IN_MS)
    } catch {
      mutedRef.current = true
      setMuted(true)
    }
  }, [fadeTo])

  const toggleMute = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (mutedRef.current || audio.paused) {
      try {
        if (audio.paused) await audio.play()
        mutedRef.current = false
        setMuted(false)
        fadeTo(targetVolumeRef.current, 900)
      } catch {
        mutedRef.current = true
        setMuted(true)
      }
      return
    }

    mutedRef.current = true
    setMuted(true)
    fadeTo(0, 500)
  }, [fadeTo])

  return { started, muted, start, toggleMute }
}
