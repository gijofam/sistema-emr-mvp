import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeToken, normalizeWhatsapp, normalizeReferralCode } from '../src/validation.js'

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

test('normaliza el formato real de las invitaciones EMR', () => {
  assert.equal(normalizeReferralCode(' emr-a71f93c2 '), 'EMR-A71F93C2')
  assert.equal(normalizeReferralCode('EMR-00000000'), 'EMR-00000000')
})

test('rechaza invitaciones malformadas con un error público 400', () => {
  for (const code of ['', undefined, 'A81KX9', 'EMR-123', 'EMR-123456789', 'EMR-G71F93C2', '../EMR-A71F93C2']) {
    assert.throws(() => normalizeReferralCode(code), (error) => error.status === 400 && error.code === 'REFERIDO_INVALIDO')
  }
})
