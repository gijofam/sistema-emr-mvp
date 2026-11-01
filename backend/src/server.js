import 'dotenv/config'
import { app } from './app.js'
import { config } from './config.js'
import { db } from './prisma/db.ts'

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`EMR API listening on port ${config.port}`)
})

const shutdown = () => server.close(async () => {
  await db.close()
  process.exit(0)
})
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
