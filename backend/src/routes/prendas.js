import { Router } from 'express'
import { getMessages, getPrendaState, unlockNextMessage } from '../services/prendaService.js'
import { createReferral, getReferral } from '../services/referralService.js'
import { saveWhatsapp } from '../services/whatsappService.js'
import { normalizeToken, normalizeWhatsapp } from '../validation.js'

export const prendasRouter = Router()
const route = (handler) => async (req, res, next) => {
  try { await handler(req, res) } catch (error) { next(error) }
}

prendasRouter.get('/:token', route(async (req, res) => {
  res.json(await getPrendaState(normalizeToken(req.params.token)))
}))
prendasRouter.get('/:token/mensajes', route(async (req, res) => {
  res.json(await getMessages(normalizeToken(req.params.token)))
}))
prendasRouter.post('/:token/mensajes/desbloquear', route(async (req, res) => {
  const result = await unlockNextMessage(normalizeToken(req.params.token))
  res.status(result.concurrentReplay ? 200 : 201).json(result)
}))
prendasRouter.post('/:token/whatsapp', route(async (req, res) => {
  const result = await saveWhatsapp(normalizeToken(req.params.token), normalizeWhatsapp(req.body?.numero))
  res.status(201).json(result)
}))
prendasRouter.get('/:token/referidos', route(async (req, res) => {
  res.json(await getReferral(normalizeToken(req.params.token)))
}))
prendasRouter.post('/:token/referidos', route(async (req, res) => {
  res.status(201).json(await createReferral(normalizeToken(req.params.token)))
}))
