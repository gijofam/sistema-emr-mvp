export function SceneFrame({ children, className = '', onClick, ariaLabel }) {
  return (
    <main className={`scene ${className}`} onClick={onClick} aria-label={ariaLabel}>
      <div className="scene__grain" aria-hidden="true" />
      <div className="scene__content">{children}</div>
    </main>
  )
}

export function ContinueButton({ children = 'CONTINUAR', onClick, secondary = false, disabled = false, type = 'button' }) {
  return (
    <button className={`action ${secondary ? 'action--secondary' : ''}`} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
