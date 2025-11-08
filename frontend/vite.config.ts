import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false,
    allowedHosts: [
      'studypal-86.preview.emergentagent.com',
      'localhost',
      '.emergentagent.com'
    ],
    hmr: {
      protocol: 'wss',
      host: 'studypal-86.preview.emergentagent.com',
      clientPort: 443
    }
  },
  define: {
    'process.env': {}
  }
})
