import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // All data flows through the Express API; same-origin in dev via proxy.
    proxy: {
      '/api': 'http://localhost:5175',
    },
  },
})
