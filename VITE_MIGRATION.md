# bilibili-live-danmaku 迁移到 Vite 方案文档

> 生成日期：2026-05-26

---

## 一、项目现状

- **框架**: Electron + Vue 3 + Vue Router + Vuex
- **构建工具**: Webpack 5 + Babel（基于 `electron-vue` 脚手架）
- **包管理器**: pnpm
- **语言**: JavaScript / TypeScript 混合
- **UI 库**: view-ui-plus (ViewUIPlus)
- **子项目**: `danmaku/`（弹幕面板）、`danmaku-scroll/`（滚动弹幕），均使用 Vue CLI 构建

### 当前构建流程

```
src/main/index.js     ──webpack──▶ dist/electron/main.js      (主进程)
src/renderer/main.js  ──webpack──▶ dist/electron/renderer.js   (渲染进程)
src/index.ejs         ──HtmlWebpackPlugin──▶ index.html        (HTML 模板)
danmaku/              ──Vue CLI──▶ danmaku-dist/              (子项目)
danmaku-scroll/       ──Vue CLI──▶ danmaku-dist/danmaku-scroll (子项目)
```

### 目录结构

```
bilibili-live-danmaku/
├── .babelrc                    # Babel 配置
├── .electron-vue/              # Webpack 配置 + 开发/build 脚本
│   ├── build.js
│   ├── dev-client.js
│   ├── dev-runner.js
│   ├── webpack.main.config.js
│   ├── webpack.renderer.config.js
│   └── webpack.web.config.js
├── src/
│   ├── index.ejs               # HTML 模板 (EJS)
│   ├── main/
│   │   ├── index.dev.js        # 开发环境入口
│   │   └── index.js            # 主进程入口
│   ├── renderer/
│   │   ├── App.vue
│   │   ├── main.js             # 渲染进程入口
│   │   ├── router/index.ts
│   │   ├── store/index.ts
│   │   └── components/         # Vue 组件（~20个）
│   └── service/                # 共享服务
├── static/                     # 静态资源
├── build/                      # electron-builder 输出
└── dist/                       # webpack 构建输出
```

---

## 二、推荐方案

使用 **[electron-vite](https://electron-vite.org/)** + **@vitejs/plugin-vue**，这是目前 Electron + Vite 生态中最成熟的方案。

### 为什么选 electron-vite

- 专为 Electron 设计，内置 main / preload / renderer 三端构建
- 对 Electron API（`__dirname`、`require`、`process.env`）有良好支持
- 内置 HMR，开发体验显著提升
- 内置对 `.node` 原生模块、static 资源、externals 的处理
- 社区活跃，文档完善

---

## 三、文件变更清单

### 3.1 需要删除的文件

| 文件/目录 | 原因 |
|-----------|------|
| `.electron-vue/`（整个目录） | webpack 配置 + dev-runner + build.js 全部废弃 |
| `.babelrc` | Vite 使用 esbuild 转译，不需要 Babel |
| `jsconfig.json` | 由 `tsconfig.json` 替代 |

### 3.2 需要新建的文件

| 文件 | 说明 |
|------|------|
| `electron.vite.config.ts` | electron-vite 主配置，定义 main / preload / renderer 三端构建 |
| `src/preload/index.ts` | Preload 脚本入口 |
| `src/renderer/index.html` | 渲染进程 HTML 入口（从 `src/index.ejs` 迁移） |
| `src/renderer/env.d.ts` | TypeScript 环境类型声明 |

### 3.3 需要修改的文件

| 文件 | 改动说明 |
|------|----------|
| `package.json` | scripts、main 字段、dependencies/devDependencies |
| `src/main/index.js` | `__static` 路径、`__dirname` 用法调整 |
| `src/renderer/main.js` | 移除 `require('module')` 相关代码 |
| `src/renderer/store/index.ts` | `vuex-electron` 的 `require` → `import` |
| `tsconfig.json` | 适配 Vite 的模块解析策略 |
| `.gitignore` | 更新构建产物目录 |
| `src/index.ejs` | → 删除，内容迁移到 `src/renderer/index.html` |

---

## 四、`package.json` 变更详情

### 4.1 删除的 devDependencies（~25个）

| 包名 | 类别 |
|------|------|
| `webpack`、`webpack-dev-server`、`webpack-hot-middleware` | Webpack 核心 |
| `babel-loader`、`@babel/core`、`@babel/preset-env`、`@babel/preset-typescript` | Babel |
| `@babel/plugin-*`（所有 10+ 个） | Babel 插件 |
| `@babel/register`、`@babel/runtime` | Babel 运行时 |
| `vue-loader`、`vue-style-loader`、`vue-html-loader`、`vue-template-compiler` | Vue SFC |
| `css-loader`、`style-loader`、`file-loader`、`url-loader`、`node-loader` | 各类 loader |
| `copy-webpack-plugin`、`html-webpack-plugin`、`mini-css-extract-plugin` | Webpack 插件 |
| `terser-webpack-plugin` | 压缩 |
| `cross-env`、`del`、`multispinner`、`cfonts` | 工具脚本 |
| `worklet-loader` | AudioWorklet 专用 |

### 4.2 新增的 devDependencies

```json
{
  "electron-vite": "^3.0.0",
  "@vitejs/plugin-vue": "^5.0.0",
  "vite": "^6.0.0"
}
```

### 4.3 Scripts 变更

```diff
- "build": "node .electron-vue/build.js && electron-builder",
+ "build": "electron-vite build && electron-builder",
- "build:all": "npm run build:danmaku && npm run build:danmaku-scroll && node .electron-vue/build.js && electron-builder",
+ "build:all": "npm run build:danmaku && npm run build:danmaku-scroll && electron-vite build && electron-builder",
- "dev": "node .electron-vue/dev-runner.js",
+ "dev": "electron-vite dev",
- "pack": "npm run pack:main && npm run pack:renderer",
+ "pack": "electron-vite build",
- "pack:main": "cross-env NODE_ENV=production webpack --progress --colors --config .electron-vue/webpack.main.config.js",
- "pack:renderer": "cross-env NODE_ENV=production webpack --progress --colors --config .electron-vue/webpack.renderer.config.js",
- "build:clean": "cross-env BUILD_TARGET=clean node .electron-vue/build.js",
+ "build:clean": "rm -rf dist-electron",
- "build:web": "cross-env BUILD_TARGET=web node .electron-vue/build.js",
+ "build:web": "vite build",
```

### 4.4 `main` 字段

```diff
- "main": "dist/electron/main.js",
+ "main": "dist-electron/main.js",
```

### 4.5 `build.files` 字段（electron-builder）

```diff
  "files": [
-   "dist/electron/**/*"
+   "dist-electron/**/*"
  ],
```

---

## 五、核心配置文件

### 5.1 `electron.vite.config.ts`

```ts
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': resolve('src/main')
      }
    },
    build: {
      rollupOptions: {
        external: [
          // .node 原生模块
          /\.node$/
        ]
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
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          // less 配置
        }
      }
    }
  }
})
```

### 5.2 `src/renderer/index.html`（从 `src/index.ejs` 迁移）

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="referrer" content="no-referrer">
  <title>bilibili-danmaku</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

### 5.3 `tsconfig.json` 更新

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "allowJs": true,
    "noImplicitAny": false,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": false,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/renderer/*"]
    },
    "outDir": "./dist-electron"
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.vue"
  ]
}
```

---

## 六、源码迁移要点

### 6.1 `__static` 全局变量

**当前做法**（主进程 `src/main/index.js`）:
```js
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
```

**迁移方案**：在 preload 脚本中通过 `contextBridge` 暴露给渲染进程：

```ts
// src/preload/index.ts
import { contextBridge } from 'electron'
import path from 'path'

contextBridge.exposeInMainWorld('electronAPI', {
  staticPath: path.join(__dirname, '../static')
})
```

或在 `electron.vite.config.ts` 中配置 `publicDir`，资源从 `public/` 目录中读取。

### 6.2 `process.env.NODE_ENV` → `import.meta.env`

| 旧写法 | 新写法 |
|--------|--------|
| `process.env.NODE_ENV === 'development'` | `import.meta.env.DEV` |
| `process.env.NODE_ENV === 'production'` | `import.meta.env.PROD` |

### 6.3 `require('module').globalPaths` 

当前 `src/index.ejs` 中有：
```html
<script>
  require('module').globalPaths.push(...)
</script>
```

**迁移**：Vite + ESM 不再需要这个 hack，直接删除。

### 6.4 `worklet-loader` → Vite 原生支持

**当前**（webpack）:
```js
import MyWorklet from 'worklet-loader!./processor.worklet.js'
```

**迁移**（Vite）:
```ts
// AudioWorklet 使用 URL 导入
const workletUrl = new URL('./processor.worklet.js', import.meta.url)
await audioContext.audioWorklet.addModule(workletUrl)
```

### 6.5 `vuex-electron` 兼容性

**当前**（CommonJS）:
```js
const { createPersistedState, createSharedMutations } = require('vuex-electron')
```

**迁移**（ESM）:
```ts
import { createPersistedState, createSharedMutations } from 'vuex-electron'
```

> ⚠️ 如果 `vuex-electron` 不支持 ESM，需要用 `vite-plugin-commonjs` 或在 `electron.vite.config.ts` 中配置 `optimizeDeps`。

### 6.6 静态资源导入

| Webpack | Vite |
|---------|------|
| `require('@/assets/image.png')` | `new URL('./assets/image.png', import.meta.url)` |
| `<img src="~assets/image.png">` | `<img src="@/assets/image.png">` |

### 6.7 CopyWebpackPlugin 模式

当前有 ONNX/WASM 文件的复制需求（被注释掉但可能启用）:
```js
// new CopyWebpackPlugin({
//   patterns: [
//     { from: "node_modules/@ricky0123/vad/dist/*.worklet.js", to: "[name][ext]" },
//     { from: "node_modules/@ricky0123/vad/dist/*.onnx", to: "[name][ext]" },
//     { from: "node_modules/onnxruntime-web/dist/*.wasm", to: "[name][ext]" },
//   ],
// })
```

**迁移**：
- 使用 Vite 的 `publicDir` 或
- 使用 `vite-plugin-static-copy` 插件

---

## 七、子项目迁移（`danmaku/`、`danmaku-scroll/`）

这两个子项目当前使用 Vue CLI，需要独立迁移为 Vite 项目：

| 子项目 | 当前构建 | 迁移目标 |
|--------|----------|----------|
| `danmaku/` | `@vue/cli-service` | Vite + `@vitejs/plugin-vue` |
| `danmaku-scroll/` | `@vue/cli-service` + TypeScript | Vite + `@vitejs/plugin-vue` |

各子项目需要：
1. 安装 `vite` + `@vitejs/plugin-vue`
2. 创建 `vite.config.ts`
3. 移动 `public/index.html` 到根目录
4. 删除 `vue.config.js`、`babel.config.js`
5. 更新 `package.json` scripts

---

## 八、风险与注意事项

| 风险项 | 等级 | 说明 |
|--------|------|------|
| **Babel 实验性插件** | 🔴 高 | `function-bind`、`throw-expressions`、`export-default-from` 等语法 esbuild 不支持，需检查源码是否实际使用 |
| **`vuex-electron` 兼容性** | 🟡 中 | 使用了 `require()` 导入，需确认是否支持 ESM |
| **`@electron/remote` 路径** | 🟡 中 | 初始化路径依赖 `__dirname`，迁移后需验证 |
| **`flv.js` 兼容性** | 🟡 中 | 在 Electron + Vite 环境需要测试 |
| **AudioWorklet** | 🟡 中 | `worklet-loader` 替换为 Vite 原生 URL 导入 |
| **`.node` 原生模块** | 🟢 低 | electron-vite 内置支持 |
| **Electron 版本兼容** | 🟢 低 | 已升级到 v42，与 electron-vite 兼容 |

---

## 九、迁移步骤（推荐顺序）

```
第1步: 安装 electron-vite + @vitejs/plugin-vue
第2步: 创建 electron.vite.config.ts
第3步: 创建 src/preload/index.ts
第4步: 将 src/index.ejs 改为 src/renderer/index.html
第5步: 清理 package.json（删除 webpack 依赖、更新 scripts）
第6步: 删除 .electron-vue/、.babelrc
第7步: 调整源码中的 process.env、__static、require 引用
第8步: 处理 worklet-loader 的 AudioWorklet 导入
第9步: 测试 pnpm dev 启动
第10步: 测试 pnpm build 构建
第11步: 子项目 danmaku/、danmaku-scroll/ 独立迁移
```

---

## 十、预期收益

| 指标 | 迁移前 (Webpack) | 迁移后 (Vite) |
|------|-----------------|---------------|
| 冷启动时间 | ~30-60s | ~3-5s |
| HMR 热更新 | ~2-5s | ~50-200ms |
| 构建时间 | ~60-120s | ~15-30s |
| devDependencies 数量 | ~50+ 个 | ~15 个 |
| 配置文件行数 | ~800+ 行 | ~50 行 |
