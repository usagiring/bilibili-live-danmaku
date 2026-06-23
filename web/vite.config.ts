import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname, 'pages'),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'pages'),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'dm/index': resolve(__dirname, 'pages/dm/index.html'),
        'dm-raw-style/index': resolve(__dirname, 'pages/dm-raw-style/index.html'),
      },
    },
  },
})
