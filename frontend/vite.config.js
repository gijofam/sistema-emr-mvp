import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const certificate = fileURLToPath(new URL('./dev-certs/server.pem', import.meta.url))
const privateKey = fileURLToPath(new URL('./dev-certs/server-key.pem', import.meta.url))

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    ...(mode === 'https' && {
      port: 5173,
      strictPort: true,
      https: {
        cert: readFileSync(certificate),
        key: readFileSync(privateKey),
      },
      proxy: {
        '/api': 'http://127.0.0.1:3000',
      },
    }),
  },
}))
