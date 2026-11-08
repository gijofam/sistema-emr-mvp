import { normalizeToken } from '../validation.js'

export const buildImportPlan = (rows, expectedOrigin = 'https://elmachorenace.com') => {
  if (!rows.length) throw new Error('No hay códigos de Handtags para importar.')

  const seen = new Set()
  const garments = rows.map((row) => {
    const code = String(row.code || '')
    const prefix = code.split('-')[0]
    if (normalizeToken(code) !== code || !/^[A-Z0-9]+-[A-Z0-9-]+$/.test(code)) {
      throw new Error(`Código de Handtags inválido: ${code}`)
    }
    if (seen.has(code)) throw new Error(`Código duplicado en Handtags: ${code}`)
    seen.add(code)
    if (!['GENERATED', 'PRINTED', 'USED'].includes(row.status)) {
      throw new Error(`El código ${code} está en un estado no importable (${row.status}).`)
    }
    if (row.productPrefix !== prefix) {
      throw new Error(`El código ${code} no coincide con el prefijo de su producto (${row.productPrefix}).`)
    }
    if (row.qrUrl !== `${expectedOrigin}/c/${code}`) {
      throw new Error(`La URL QR del código ${code} no coincide con el dominio y token esperados.`)
    }
    return { token: code, tipoPrenda: prefix }
  })

  return garments
}

export const summarizeGarments = (garments) => Object.fromEntries(
  [...new Set(garments.map((garment) => garment.tipoPrenda))]
    .sort()
    .map((prefix) => [prefix, garments.filter((garment) => garment.tipoPrenda === prefix).length]),
)
