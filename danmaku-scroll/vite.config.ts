import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve('src')
    }
  },
  base: './',
  build: {
    outDir: '../danmaku-dist/danmaku-scroll',
    emptyOutDir: true,
  }
})
