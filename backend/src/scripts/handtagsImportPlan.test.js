import test from 'node:test'
import assert from 'node:assert/strict'
import { buildImportPlan, summarizeGarments } from './handtagsImportPlan.js'

const row = (code, overrides = {}) => ({
  code,
  qrUrl: `https://elmachorenace.com/c/${code}`,
  status: 'GENERATED',
  productPrefix: code.split('-')[0],
  ...overrides,
})

test('acepta cualquier prefijo de producto y cualquier cantidad de códigos', () => {
  const plan = buildImportPlan([row('PRF-K3U9S7'), row('PBF-J1O9O2'), row('PMC-B6S2U7')])
  assert.deepEqual(plan, [
    { token: 'PRF-K3U9S7', tipoPrenda: 'PRF' },
    { token: 'PBF-J1O9O2', tipoPrenda: 'PBF' },
    { token: 'PMC-B6S2U7', tipoPrenda: 'PMC' },
  ])
  assert.deepEqual(summarizeGarments(plan), { PBF: 1, PMC: 1, PRF: 1 })
})

test('rechaza códigos con URL, producto o estado inconsistentes', () => {
  assert.throws(() => buildImportPlan([row('PRF-K3U9S7', { qrUrl: 'https://emr.pe/c/PRF-K3U9S7' })]), /URL QR/)
  assert.throws(() => buildImportPlan([row('PRF-K3U9S7', { productPrefix: 'PBF' })]), /prefijo/)
  assert.deepEqual(buildImportPlan([row('PRF-K3U9S7', { status: 'USED' })]), [{ token: 'PRF-K3U9S7', tipoPrenda: 'PRF' }])
  assert.throws(() => buildImportPlan([row('PRF-K3U9S7', { status: 'VOID' })]), /no importable/)
  assert.throws(() => buildImportPlan([row('PRF-K3U9S7'), row('PRF-K3U9S7')]), /duplicado/)
})
