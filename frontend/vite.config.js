import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.', // Ensure Vite looks for index.html in frontend/
  build: {
    outDir: 'dist',  // Output directory matches Flask's expected static folder
    emptyOutDir: true,
  },
  server: {
    // Allows frontend to work on cloud/remote IDEs, containerized setups, and locally
    host: '0.0.0.0',  // Listen on all network interfaces including for cloud IDEs
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': 'http://localhost:8000', // Proxy backend API
    },
    // Accept most cloud IDE tunnels, localhost, and others by default
    allowedHosts: [
      '.localhost',
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '.kavia.ai',
      '.github.dev',
      '.gitpod.io',
      '.codespaces.github.dev',
      '.coder.com',
      '::1'
    ],
    watch: {
      usePolling: true,
      interval: 100,
    }
  },
  publicDir: 'public', // Default Vite static assets, if present
  base: '/', // Ensure root for absolute URL resolution
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
