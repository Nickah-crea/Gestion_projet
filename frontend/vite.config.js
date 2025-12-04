import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'   // ← CES DEUX LIGNES ÉTAIENT MANQUANTES

export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {
    proxy: {
      '/ecran-travail': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../backend/src/main/resources/static',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
  },
  css: {
    postcss: './postcss.config.js'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url))   // indispensable pour les chemins dans SCSS
    }
  }
})

