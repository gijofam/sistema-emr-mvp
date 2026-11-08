const API_URL = (import.meta.env.DEV ? '/api/v1' : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1')).replace(/\/$/, '')

export class ApiError extends Error {
  constructor(status, payload) {
    super(payload?.message || 'No pudimos conectar con la experiencia EMR.')
    this.status = status
    this.code = payload?.code || 'ERROR_CONEXION'
    this.details = payload?.details
  }
}

const request = async (path, options = {}) => {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
  } catch {
    throw new ApiError(0, { code: 'ERROR_CONEXION', message: 'No pudimos conectar con EMR. Revisa tu conexión e inténtalo nuevamente.' })
  }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(response.status, payload)
  return payload
}

const garmentPath = (token) => `/prendas/${encodeURIComponent(token)}`

export const api = {
  getPublicReferral: (code) => request(`/referidos/${encodeURIComponent(code)}`),
  getMessages: (token) => request(`${garmentPath(token)}/mensajes`),
  unlockMessage: (token) => request(`${garmentPath(token)}/mensajes/desbloquear`, { method: 'POST' }),
  saveWhatsapp: (token, numero) => request(`${garmentPath(token)}/whatsapp`, {
    method: 'POST', body: JSON.stringify({ numero }),
  }),
  getReferral: (token) => request(`${garmentPath(token)}/referidos`),
  createReferral: (token) => request(`${garmentPath(token)}/referidos`, { method: 'POST' }),
}
