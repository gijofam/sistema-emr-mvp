import { SceneFrame, ContinueButton } from './SceneFrame'

export function StatusScene({ title, message, onRetry, loading = false }) {
  return (
    <SceneFrame className="scene--status">
      <span className="eyebrow">EMR</span>
      <h1>{title}</h1>
      <p>{message}</p>
      {onRetry && <ContinueButton onClick={onRetry} disabled={loading}>{loading ? 'CONECTANDO…' : 'INTENTAR DE NUEVO'}</ContinueButton>}
    </SceneFrame>
  )
}
