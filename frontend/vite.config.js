import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envPrefix: ['ENTRA_'],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'localhost',
      'host.docker.internal'
    ],
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
