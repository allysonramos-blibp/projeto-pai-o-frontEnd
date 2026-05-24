import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/auth': {
        target: 'https://projeto-pai-o-api.onrender.com',
        changeOrigin: true,
      },
      '/api': {
        target: 'https://projeto-pai-o-api.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
