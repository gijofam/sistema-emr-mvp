import { Router } from 'express'
import { getPublicReferral } from '../services/referralService.js'
import { normalizeReferralCode } from '../validation.js'

export const referidosRouter = Router()
referidosRouter.get('/:codigoReferido', async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store')
    res.json(await getPublicReferral(normalizeReferralCode(req.params.codigoReferido)))
  } catch (error) {
    next(error)
  }
})
