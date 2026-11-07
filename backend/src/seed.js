import 'dotenv/config'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { frases } from './data/frases.js'
import { validateFrases } from './scripts/validatePhrases.js'

export async function seedFrases(database) {
  validateFrases()
  return database.transaction(async (tx) => {
    const existingCodes = new Set()
    const conflicts = []
    for (const phrase of frases) {
      const existing = await tx.orm.public.Frase.where({ codigo: phrase.codigo }).first()
      if (!existing) continue
      existingCodes.add(phrase.codigo)
      if (existing.texto !== phrase.texto || existing.categoria !== phrase.categoria || existing.activa !== true) {
        conflicts.push(phrase.codigo)
      }
    }
    if (conflicts.length) {
      throw new Error(`Seed detenido sin insertar frases. Códigos existentes con datos distintos: ${conflicts.join(', ')}. Revísalos manualmente; no se modificó ningún registro.`)
    }
    let inserted = 0
    for (const phrase of frases) {
      if (!existingCodes.has(phrase.codigo)) {
        await tx.orm.public.Frase.create(phrase)
        inserted++
      }
    }
    return inserted
  })
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const { db } = await import('./prisma/db.ts')
  try {
    const inserted = await seedFrases(db)
    if (process.env.SEED_DEVELOPMENT_GARMENTS === 'true') {
      const developmentGarments = [
        { token: 'A81KX9', tipoPrenda: 'POLO' },
        { token: 'PRF-F6A2K4', tipoPrenda: 'POLO_REGULAR_FIT' },
        { token: 'MC-CB83E6', tipoPrenda: 'MANGA_CERO' },
      ]
      for (const garment of developmentGarments) {
        if (!await db.orm.public.Prenda.where({ token: garment.token }).first()) {
          await db.orm.public.Prenda.create({ ...garment, etapaEmr: 'RENACER', estado: 'GENERADA' })
        }
      }
    }
    console.log(`Seed EMR completado: 500 frases oficiales verificadas; ${inserted} insertadas.`)
  } finally {
    await db.close()
  }
}
