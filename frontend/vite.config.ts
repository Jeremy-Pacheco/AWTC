import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useHttps = env.VITE_USE_HTTPS === 'true'
  
  // SSL certificate paths
  const sslKeyPath = path.resolve(__dirname, '../backend/ssl/key.pem')
  const sslCertPath = path.resolve(__dirname, '../backend/ssl/cert.pem')
  
  const httpsConfig = useHttps && fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)
    ? {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
      }
    : undefined
  
  if (useHttps && !httpsConfig) {
    console.warn('⚠️  HTTPS enabled but SSL certificates not found.')
    console.warn('   Run: cd backend && node scripts/generate-ssl-cert.js')
  }
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      https: httpsConfig,
      port: 5173,
    },
  }
})
