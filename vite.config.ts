import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@electric-sql/pglite']
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  },
  resolve: {
    alias: {
      '@pglite': resolve(__dirname, 'public/pglite')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          pglite: ['@electric-sql/pglite']
        }
      }
    }
  },
  worker: {
    format: 'es'
  }
})
