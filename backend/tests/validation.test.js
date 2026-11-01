import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeToken, normalizeWhatsapp } from '../src/validation.js'

test('normaliza tokens EMR alfanuméricos y con guion', () => {
  assert.equal(normalizeToken(' a81kx9 '), 'A81KX9')
  assert.equal(normalizeToken(' prf-f6a2k4 '), 'PRF-F6A2K4')
  assert.equal(normalizeToken('mc-cb83e6'), 'MC-CB83E6')
})
test('rechaza entradas inválidas', () => {
  assert.throws(() => normalizeToken('../bad'))
  assert.throws(() => normalizeToken('-PRF-F6A2K4'))
  assert.throws(() => normalizeToken('PRF-F6A2K4-'))
  assert.throws(() => normalizeToken('PRF_F6A2K4'))
  assert.throws(() => normalizeWhatsapp('123'))
})
test('normaliza WhatsApp internacional', () => {
  assert.equal(normalizeWhatsapp('+51 999 888 777'), '+51999888777')
})
