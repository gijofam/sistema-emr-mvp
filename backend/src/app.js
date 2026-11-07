import express from 'express'
import { config } from './config.js'
import { AppError } from './errors.js'
import { prendasRouter } from './routes/prendas.js'
import { referidosRouter } from './routes/referidos.js'

export const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '16kb' }))
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && config.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/v1/prendas', prendasRouter)
app.use('/api/v1/referidos', referidosRouter)
app.use((_req, res) => res.status(404).json({
  code: 'RUTA_NO_ENCONTRADA',
  message: 'La experiencia solicitada no está disponible.',
}))
app.use((error, _req, res, _next) => {
  const malformedJson = error?.type === 'entity.parse.failed'
  if (!(error instanceof AppError) && !malformedJson) console.error('Unexpected server error', error)
  const status = error instanceof AppError ? error.status : malformedJson ? 400 : 500
  res.status(status).json({
    code: error instanceof AppError ? error.code : malformedJson ? 'DATOS_INVALIDOS' : 'ERROR_INTERNO',
    message: error instanceof AppError ? error.message : malformedJson ? 'Los datos enviados no son válidos.' : 'No pudimos completar la experiencia en este momento.',
    ...(error instanceof AppError && error.details ? { details: error.details } : {}),
  })
})
