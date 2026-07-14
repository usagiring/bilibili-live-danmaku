import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': resolve('src/main'),
      },
    },
    build: {
      rollupOptions: {
        external: ['electron', 'electron/**', '@tokine/bilibili-bridge', /\.node$/],
        output: {
          format: 'es',
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['electron'],
        output: {
          format: 'cjs',
          entryFileNames: 'index.cjs',
        },
      },
    },
  },
  renderer: {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve('src/renderer'),
      },
      extensions: ['.js', '.ts', '.vue', '.json', '.css', '.less'],
    },
    publicDir: resolve('static'),
    // Electron 渲染进程使用 nodeIntegration，Electron API 在运行时可用
    optimizeDeps: {
      exclude: ['electron'],
    },
    build: {
      rollupOptions: {
        input: resolve('src/renderer/index.html'),
        external: ['electron'],
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
  },
})
