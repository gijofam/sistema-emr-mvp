// The demo uses three existing phrases without reading or writing PostgreSQL.
export const DEMO_MESSAGES = [
  { codigo: 297, categoria: 'QUIEBRE', texto: 'Hay una diferencia entre tener miedo de perder algo y reconocer que permanecer en ese lugar también puede costarte demasiado.' },
  { codigo: 93, categoria: 'RENACER', texto: 'El pasado pesa menos cuando dejas de utilizarlo como un lugar al que regresar para explicar cada decisión que tomas.' },
  { codigo: 8, categoria: 'EVOLUCION', texto: 'Hay momentos en los que avanzar significa aceptar que algunas personas, costumbres y versiones de ti ya no pueden acompañarte.' },
]

const STORAGE_KEY = 'emr-demo-next-message-v1'
let fallbackIndex = 0

function readIndex() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) return fallbackIndex
    const value = Number(stored)
    return Number.isInteger(value) && value >= 0 && value < DEMO_MESSAGES.length ? value : fallbackIndex
  } catch {
    return fallbackIndex
  }
}

function writeIndex(index) {
  fallbackIndex = index
  try { window.localStorage.setItem(STORAGE_KEY, String(index)) } catch { /* Private browsing can block storage. */ }
}

export function getDemoState() {
  return {
    token: null,
    tipoPrenda: 'DEMO',
    etapaEmr: DEMO_MESSAGES[readIndex()].categoria,
    estado: 'GENERADA',
    fechaActivacion: null,
    mensajesDesbloqueados: 0,
    totalMensajes: DEMO_MESSAGES.length,
    nextAvailableAt: null,
    canUnlock: true,
    serverTime: new Date().toISOString(),
    mensajes: [],
  }
}

export function unlockDemoMessage() {
  const index = readIndex()
  const message = { ...DEMO_MESSAGES[index], numeroMensaje: index + 1, fechaDesbloqueo: new Date().toISOString() }
  writeIndex((index + 1) % DEMO_MESSAGES.length)
  return {
    ...getDemoState(),
    etapaEmr: message.categoria,
    estado: index === DEMO_MESSAGES.length - 1 ? 'COMPLETADA' : 'ACTIVA',
    mensajesDesbloqueados: index + 1,
    mensaje: message,
    mensajes: DEMO_MESSAGES.slice(0, index + 1).map((phrase, position) => ({ ...phrase, numeroMensaje: position + 1, fechaDesbloqueo: message.fechaDesbloqueo })),
  }
}
