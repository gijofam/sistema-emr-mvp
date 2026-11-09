import test from 'node:test'
import assert from 'node:assert/strict'
import { parseEmrLaunchEnabled } from './config.js'

test('el lanzamiento solo se activa con el valor exacto true', () => {
  for (const [value, expected] of [
    [undefined, false],
    ['false', false],
    ['TRUE', false],
    ['1', false],
    ['true', true],
  ]) {
    assert.equal(parseEmrLaunchEnabled(value), expected, `EMR_LAUNCH_ENABLED=${value}`)
  }
})
