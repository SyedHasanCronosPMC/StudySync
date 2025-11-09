import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const previewHost = process.env.VITE_PREVIEW_HOST?.trim()
const usePreviewProxy = Boolean(previewHost)

const allowedHosts = ['localhost']
if (usePreviewProxy && previewHost) {
  allowedHosts.push(previewHost, '.emergentagent.com')
}

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
    allowedHosts,
    hmr: usePreviewProxy && previewHost
      ? {
          protocol: 'wss',
          host: previewHost,
          clientPort: 443,
        }
      : {
          protocol: 'ws',
          host: 'localhost',
          overlay: false,
        },
  },
  define: {
    'process.env': {},
  },
})
