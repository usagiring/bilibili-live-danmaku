import { rmSync } from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron, { onstart } from 'vite-plugin-electron'
import pkg from './package.json'
import { writeFileSync } from 'fs'
import renderer from 'vite-plugin-electron-renderer'
import { createHtmlPlugin } from 'vite-plugin-html'
import autoprefixer from 'autoprefixer'

rmSync('dist', { recursive: true, force: true }) // v14.14.0

const config = ({ mode }) => {
  const isProd = mode === 'production'
  const envPrefix = 'APP_'
  const { APP_TITLE = '' } = loadEnv(mode, process.cwd(), envPrefix)

  return {
    plugins: [
      vue(),
      renderer({
        resolve() {
          return [
            'electron-store',
          ]
        }
      }),
      electron({
        main: {
          entry: 'electron/main/index.ts',
          vite: {
            build: {
              // For Debug
              sourcemap: true,
              outDir: 'dist/electron/main',
            },
            // Will start Electron via VSCode Debug
            plugins: [process.env.VSCODE_DEBUG ? onstart() : null],
          },
        },
        preload: {
          input: {
            // You can configure multiple preload here
            index: path.join(__dirname, 'electron/preload/index.ts'),
          },
          vite: {
            build: {
              // For Debug
              sourcemap: 'inline',
              outDir: 'dist/electron/preload',
            },
          },
        },
        // Enables use of Node.js API in the Renderer-process
        // https://github.com/electron-vite/vite-plugin-electron/tree/main/packages/electron-renderer#electron-renderervite-serve
        renderer: {},
      }),
      createHtmlPlugin({
        minify: isProd,
        inject: {
          data: {
            title: APP_TITLE,
          },
        }
      })
    ],
    build: {
      target: 'es2015',
      outDir: path.resolve(__dirname, 'dist'),
      assetsDir: 'assets',
      assetsInlineLimit: 8192,
      sourcemap: !isProd,
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
        output: {
          chunkFileNames: 'js/[name].[hash].js',
          entryFileNames: 'js/[name].[hash].js',
          // assetFileNames: "assets/[name].[hash].[ext]",
        }
      }
    },
    envPrefix,
    resolve: {
      alias: [
        { find: /^@\//, replacement: `${path.resolve(__dirname, 'src')}/` },
        { find: /^~/, replacement: '' }
      ],
      extensions: ['.js', '.mjs', '.vue', '.json', '.less', '.css', '.ts']
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer
        ],
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "${path.resolve(__dirname, 'src/styles/variable.less')}";`
        }
      }
    },
    preview: {
      port: 5000
    },
    server: process.env.VSCODE_DEBUG ? {
      host: pkg.debug.env.VITE_DEV_SERVER_HOSTNAME,
      port: pkg.debug.env.VITE_DEV_SERVER_PORT,
    } : undefined,
    // build: {
    //   rollupOptions: {
    //     // https://rollupjs.org/guide/en/#outputmanualchunks
    //     output: {
    //       manualChunks: {
    //         'group-user': [
    //           './src/UserDetails',
    //           './src/UserDashboard',
    //           './src/UserProfileEdit',
    //         ],
    //       },
    //     },
    //   }
    // }
  }
}

// https://vitejs.dev/config/
export default defineConfig(config)


