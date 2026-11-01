const parseOrigins = (value) =>
  (value || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

export const config = {
  port: Number.parseInt(process.env.PORT || '3000', 10),
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),
  unlockDelayMs: Number.parseInt(process.env.UNLOCK_DELAY_MS || '86400000', 10),
}
