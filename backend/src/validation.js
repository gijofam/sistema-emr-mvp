import { AppError } from './errors.js'

export const normalizeToken = (value) => {
  const token = String(value || '').trim().toUpperCase()
  if (!/^[A-Z0-9](?:[A-Z0-9-]{4,30}[A-Z0-9])$/.test(token)) {
    throw new AppError(400, 'TOKEN_INVALIDO', 'El código de la prenda no es válido.')
  }
  return token
}

export const normalizeWhatsapp = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) {
    throw new AppError(400, 'WHATSAPP_INVALIDO', 'Ingresa un número de WhatsApp válido, incluyendo el código de país.')
  }
  return `+${digits}`
}
