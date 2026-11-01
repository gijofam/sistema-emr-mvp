export function SoundControl({ visible, muted, onToggle }) {
  if (!visible) return null

  return (
    <button
      className={`sound-control ${muted ? 'is-muted' : ''}`}
      type="button"
      onClick={onToggle}
      aria-label={muted ? 'Activar música' : 'Silenciar música'}
      aria-pressed={muted}
      title={muted ? 'Activar música' : 'Silenciar música'}
    >
      <span aria-hidden="true">♪</span>
    </button>
  )
}
