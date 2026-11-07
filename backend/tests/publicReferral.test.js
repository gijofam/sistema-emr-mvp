import test from 'node:test'
import assert from 'node:assert/strict'
import { getPublicReferral } from '../src/services/referralService.js'

test('la consulta pública expone solo código y validez, sin convertir ni leer prendas', async () => {
  const row = {
    id: 42, codigoReferido: 'EMR-A71F93C2', prendaOrigenId: 7,
    estado: 'PENDIENTE', fechaConversion: null,
    prendaOrigen: { token: 'PRIVADO', contactoWhatsappId: 9, mensajes: ['PRIVADO'] },
  }
  const original = structuredClone(row)
  let reads = 0
  const client = { orm: { public: { Referido: {
    where: (query) => {
      assert.deepEqual(query, { codigoReferido: row.codigoReferido })
      return { first: async () => { reads += 1; return row } }
    },
  } } } }
  assert.deepEqual(await getPublicReferral(row.codigoReferido, client), { codigoReferido: 'EMR-A71F93C2', valido: true })
  assert.equal(reads, 1)
  assert.deepEqual(row, original)
})

test('una invitación inexistente devuelve un error 404 sin datos privados', async () => {
  const client = { orm: { public: { Referido: { where: () => ({ first: async () => null }) } } } }
  await assert.rejects(getPublicReferral('EMR-FFFFFFFF', client), (error) => {
    assert.equal(error.status, 404)
    assert.equal(error.code, 'INVITACION_NO_DISPONIBLE')
    assert.equal(error.details, undefined)
    return true
  })
})
