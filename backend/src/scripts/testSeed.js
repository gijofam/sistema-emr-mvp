import assert from 'node:assert/strict'
import { frases } from '../data/frases.js'
import { seedFrases } from '../seed.js'
import { compareWithSource, validateFrases } from './validatePhrases.js'

assert.equal(Object.values(validateFrases()).reduce((total, count) => total + count, 0), 500)
assert.ok(compareWithSource())
assert.throws(() => validateFrases([{ ...frases[0], categoria: 'MENTALIDAD' }, ...frases.slice(1)]), /Categoría inválida/)
assert.throws(() => compareWithSource([{ ...frases[0], texto: 'Texto modificado' }, ...frases.slice(1)]), /no coincide/)

function fakeDatabase(initial = [], failAt = null) {
  let records = new Map(initial.map((phrase) => [phrase.codigo, phrase]))
  return {
    get records() { return records },
    async transaction(callback) {
      const draft = new Map(records)
      const tx = {
        orm: { public: { Frase: {
          where: ({ codigo }) => ({ first: async () => draft.get(codigo) || null }),
          create: async (phrase) => {
            if (phrase.codigo === failAt) throw new Error('Fallo simulado')
            if (draft.has(phrase.codigo)) throw new Error('Código repetido')
            draft.set(phrase.codigo, phrase)
          },
        } } },
      }
      const result = await callback(tx)
      records = draft
      return result
    },
  }
}

const empty = fakeDatabase()
assert.equal(await seedFrases(empty), 500)
assert.equal(empty.records.size, 500)
assert.equal(await seedFrases(empty), 0)
assert.equal(empty.records.size, 500)

const conflict = fakeDatabase([{ ...frases[83], texto: 'Frase anterior' }])
await assert.rejects(seedFrases(conflict), /Códigos existentes con datos distintos: 84/)
assert.equal(conflict.records.size, 1)

const interrupted = fakeDatabase([], 250)
await assert.rejects(seedFrases(interrupted), /Fallo simulado/)
assert.equal(interrupted.records.size, 0)

console.log('Seed verificado sin PostgreSQL: 500 inserciones, segunda ejecución 0, conflicto y fallo sin cambios.')
