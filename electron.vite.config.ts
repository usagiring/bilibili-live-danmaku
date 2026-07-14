import { defineConfig } from 'electron-vite'
// import nodeExternals from 'rollup-plugin-node-externals'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [
      // externalizeDepsPlugin(),
      // nodeExternals({
      //   // 🚨 关键配置：不要把你的项目 A (bilibili-bridge) 排除在外
      //   // 这样 Vite 就会知道这是一个需要特殊处理的本地依赖
      //   include: ['@tokine/bilibili-bridge'],
      // }),
    ],
    resolve: {
      alias: {
        '@': resolve('src/main'),
      },
    },
    build: {
      externalizeDeps: true,
      rollupOptions: {
        // external: ['electron', 'electron/**', /\.node$/],
      },
    },
  },
  preload: {
    plugins: [],
    build: {
      externalizeDeps: true,
      rollupOptions: {
        // external: ['electron'],
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
