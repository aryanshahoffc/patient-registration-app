import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@electric-sql/pglite'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/@electric-sql\/pglite/, /node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        format: 'es',
        inlineDynamicImports: true
      }
    }
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
  }
})
