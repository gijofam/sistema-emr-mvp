import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import { getDemoState, unlockDemoMessage } from '../demo/demoExperience'

export function useExperience(token, demo = false) {
  const [state, setState] = useState(() => demo
    ? { status: 'ready', data: getDemoState(), error: null }
    : { status: 'loading', data: null, error: null })

  const load = useCallback(async () => {
    if (demo) {
      setState({ status: 'ready', data: getDemoState(), error: null })
      return
    }
    if (!token) {
      setState({ status: 'error', data: null, error: { code: 'TOKEN_INVALIDO', message: 'Este código no pertenece a una prenda EMR activa.' } })
      return
    }
    setState((current) => ({ ...current, status: 'loading', error: null }))
    try {
      setState({ status: 'ready', data: await api.getMessages(token), error: null })
    } catch (error) {
      setState({ status: 'error', data: null, error })
    }
  }, [token, demo])

  useEffect(() => {
    if (demo) return undefined
    let active = true
    if (!token) {
      Promise.resolve().then(() => {
        if (active) setState({ status: 'error', data: null, error: { code: 'TOKEN_INVALIDO', message: 'Este código no pertenece a una prenda EMR activa.' } })
      })
    } else {
      api.getMessages(token)
        .then((data) => { if (active) setState({ status: 'ready', data, error: null }) })
        .catch((error) => { if (active) setState({ status: 'error', data: null, error }) })
    }
    return () => { active = false }
  }, [token, demo])

  const unlock = useCallback(async () => {
    if (demo) {
      const data = unlockDemoMessage()
      setState({ status: 'ready', data, error: null })
      return data
    }
    try {
      const data = await api.unlockMessage(token)
      setState({ status: 'ready', data, error: null })
      return data
    } catch (error) {
      if ((error.status === 423 || error.status === 409) && error.details) {
        setState({ status: 'ready', data: error.details, error: null })
        return { ...error.details, locked: error.status === 423 }
      }
      throw error
    }
  }, [token, demo])

  return { ...state, reload: load, unlock, setData: (data) => setState({ status: 'ready', data, error: null }) }
}
