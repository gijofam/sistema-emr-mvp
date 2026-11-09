import { Router } from 'express'
import { config } from '../config.js'
import { AppError } from '../errors.js'
import { getMessages, getPrendaState, unlockNextMessage } from '../services/prendaService.js'
import { createReferral, getReferral } from '../services/referralService.js'
import { saveWhatsapp } from '../services/whatsappService.js'
import { normalizeToken, normalizeWhatsapp } from '../validation.js'

export const prendasRouter = Router()
const route = (handler) => async (req, res, next) => {
  try { await handler(req, res) } catch (error) { next(error) }
}
const requireLaunch = (_req, _res, next) => {
  if (!config.emrLaunchEnabled) {
    return next(new AppError(423, 'EMR_PRELAUNCH', 'La experiencia de esta prenda EMR aún no ha sido activada.'))
  }
  next()
}

prendasRouter.get('/:token', route(async (req, res) => {
  res.json(await getPrendaState(normalizeToken(req.params.token)))
}))
prendasRouter.get('/:token/mensajes', route(async (req, res) => {
  res.json(await getMessages(normalizeToken(req.params.token)))
}))
prendasRouter.post('/:token/mensajes/desbloquear', requireLaunch, route(async (req, res) => {
  const result = await unlockNextMessage(normalizeToken(req.params.token))
  res.status(result.concurrentReplay ? 200 : 201).json(result)
}))
prendasRouter.post('/:token/whatsapp', requireLaunch, route(async (req, res) => {
  const result = await saveWhatsapp(normalizeToken(req.params.token), normalizeWhatsapp(req.body?.numero))
  res.status(201).json(result)
}))
prendasRouter.get('/:token/referidos', route(async (req, res) => {
  res.json(await getReferral(normalizeToken(req.params.token)))
}))
prendasRouter.post('/:token/referidos', requireLaunch, route(async (req, res) => {
  res.status(201).json(await createReferral(normalizeToken(req.params.token)))
}))
