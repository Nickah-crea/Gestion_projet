import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

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
      changeOrigin: true,
      rewrite: (path) => path 
    }
  }
},
  build: {
    outDir: '../backend/src/main/resources/static',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
  }
})