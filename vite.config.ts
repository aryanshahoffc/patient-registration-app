import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@electric-sql/pglite']
  },
  build: {
    rollupOptions: {
      external: ['@electric-sql/pglite'],
      output: {
        manualChunks: {
          pglite: ['@electric-sql/pglite']
        }
      }
    },
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@pglite': resolve(__dirname, 'public/pglite')
    }
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  worker: {
    format: 'es'
  }
})
