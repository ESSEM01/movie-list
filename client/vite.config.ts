import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  ssr: {
    noExternal: ['swiper']
  },
  // In produzione il client e servito dal server Adonis (@adonisjs/static):
  // la build finisce in server/public, che `node ace build` copia in build/
  build: {
    outDir: '../server/public',
    emptyOutDir: true
  }
})
