import test from 'node:test'
import assert from 'node:assert/strict'
import { app } from '../app.js'
import { config } from '../config.js'

test('prelanzamiento bloquea las tres escrituras antes de sus handlers y deja los GET disponibles', async (t) => {
  const original = config.emrLaunchEnabled
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  t.after(async () => {
    config.emrLaunchEnabled = original
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  })
  const base = `http://127.0.0.1:${server.address().port}/api/v1/prendas`

  config.emrLaunchEnabled = false
  for (const path of [
    '/A81KX9/mensajes/desbloquear',
    '/A81KX9/whatsapp',
    '/A81KX9/referidos',
  ]) {
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero: '+51999999999' }),
    })
    assert.equal(response.status, 423, path)
    assert.deepEqual(await response.json(), {
      code: 'EMR_PRELAUNCH',
      message: 'La experiencia de esta prenda EMR aún no ha sido activada.',
    })
  }

  const readResponse = await fetch(`${base}/bad`)
  assert.equal(readResponse.status, 400)
  assert.equal((await readResponse.json()).code, 'TOKEN_INVALIDO')

  config.emrLaunchEnabled = true
  for (const path of ['/mensajes/desbloquear', '/whatsapp', '/referidos']) {
    const activeResponse = await fetch(`${base}/bad${path}`, { method: 'POST' })
    assert.equal(activeResponse.status, 400, path)
    assert.equal((await activeResponse.json()).code, 'TOKEN_INVALIDO')
  }
})
