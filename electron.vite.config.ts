import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'

// 复制 bilibili-bridge 的 proto 文件到构建输出目录
function copyProtoFiles() {
  return {
    name: 'copy-proto-files',
    closeBundle() {
      const protoDir = resolve('node_modules/@tokine/bilibili-bridge/dist/lib/service/protobuf')
      if (!existsSync(protoDir)) return
      const outDir = resolve('out/main')
      for (const file of readdirSync(protoDir).filter(f => f.endsWith('.proto'))) {
        copyFileSync(resolve(protoDir, file), resolve(outDir, file))
      }
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copyProtoFiles()],
    resolve: {
      alias: {
        '@': resolve('src/main')
      }
    },
    build: {
      rollupOptions: {
        external: ['electron', 'electron/**', /\.node$/]
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve('src/renderer')
      },
      extensions: ['.js', '.ts', '.vue', '.json', '.css', '.less']
    },
    publicDir: resolve('static'),
    // Electron 渲染进程使用 nodeIntegration，Node 内置模块 & Electron 模块在运行时可用
    optimizeDeps: {
      exclude: ['fs', 'path', 'os', 'child_process', 'crypto', 'events', 'util', 'assert', 'stream', 'http', 'https', 'url', 'net', 'tls', 'dns', 'dgram', 'electron', '@electron/remote']
    },
    build: {
      rollupOptions: {
        input: resolve('src/renderer/index.html'),
        external: ['fs', 'path', 'os', 'child_process', 'crypto', 'events', 'util', 'assert', 'stream', 'http', 'https', 'url', 'net', 'tls', 'dns', 'dgram', 'electron', '@electron/remote']
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    }
  }
})
