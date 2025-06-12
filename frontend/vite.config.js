import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    },
    allowedHosts: [
      'vscode-internal-4748-beta.beta01.cloud.kavia.ai'
    ]
  }
})
