import { app, BrowserWindow, ipcMain, nativeImage, session, IpcMainEvent, netLog, systemPreferences } from 'electron'
import path from 'path'
import fs from 'fs'
import { autoUpdater } from 'electron-updater'
import Store from 'electron-store'
import { IPC_CHECK_FOR_UPDATE, IPC_DOWNLOAD_UPDATE, IPC_UPDATE_AVAILABLE, IPC_DOWNLOAD_PROGRESS } from '../service/const'
import { initialize, enable } from '@electron/remote/main'
import { registerIpcHandlers } from './ipc'
import globalVar from '../service/global'
import { start as startBiliBridge } from '../service/bilibili-bridge'

declare global {
  // eslint-disable-next-line no-var
  var __static: string
}

// 开发模式下禁用硬件加速
if (import.meta.env.DEV) {
  app.disableHardwareAcceleration()
}

initialize()

process.on('uncaughtException', error => {
  console.log('uncaughtException')
  console.error(error)
})

const store = new Store<{ clientId: string }>({ defaults: { clientId: '' } })

// 恢复持久化的 clientId 到全局变量
globalVar.clientId = store.get('clientId', '')

async function initApp() {
  if (!import.meta.env.DEV) {
    await startBiliBridge()
  } else {
    globalVar.port = 3000
    globalVar.baseUrl = `http://127.0.0.1:3000`
  }
}

/**
 * Set `__static` path to static files in production
 */
if (!import.meta.env.DEV) {
  global.__static = path.join(__dirname, '../static').replace(/\\/g, '\\\\')
}

let mainWindow: BrowserWindow | null = null
const winURL = import.meta.env.DEV ? process.env.ELECTRON_RENDERER_URL! : `file://${path.join(__dirname, '../renderer/index.html')}`

const preloadPath = path.join(__dirname, '../preload/index.js')

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 900,
    useContentSize: true,
    width: 1200,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: preloadPath,
    },
    // icon: path.join(__dirname, '../../build/icons/icon.ico')
  })
  mainWindow.setIcon(nativeImage.createFromPath(path.join(__dirname, '../../build/icons/icon.ico')))
  mainWindow.setMenuBarVisibility(false)

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
    app.quit()
  })

  enable(mainWindow.webContents)
}

app.on('ready', async () => {
  // 等待 bridge / 初始化完成
  await initApp()

  // 注册渲染进程需要的 IPC handlers（必须在 createWindow 之前，避免 invoke 时无 handler）
  ipcMain.handle('get-client-id', () => globalVar.clientId)
  ipcMain.handle('set-client-id', (_event, clientId: string) => {
    globalVar.clientId = clientId
    store.set('clientId', clientId)
  })
  ipcMain.handle('get-base-url', () => globalVar.baseUrl)
  ipcMain.handle('get-speech-to-text-models', () => {
    const modelsDir = import.meta.env.DEV ? '/Users/tokine/Tokine/bilibili-live-danmaku/models' : path.join(__dirname, '../models')
    try {
      const files: string[] = fs.readdirSync(modelsDir)
      return files.filter(f => f.includes('sherpa-onnx-sense-voice'))
    } catch (e) {
      console.error(e)
      return []
    }
  })

  // DevTools 在 nodeIntegration 模式下可能卡顿，按需开启
  // if (import.meta.env.DEV) {
  //   mainWindow?.webContents.openDevTools()
  // }

  // 视频流需要加上referer
  // Modify the user agent for all requests to the following urls.
  // const filter = {
  //   urls: [
  //     'https://*.bilivideo.com/*',
  //     'https://*.bilibili.com/*',
  //     "https://*.com/*"
  //   ]
  // }

  // session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
  //   // 模拟真实浏览器请求头（与 HAR 一致）
  //   details.requestHeaders['User-Agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
  //   details.requestHeaders['Accept'] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
  //   details.requestHeaders['Accept-Language'] = "zh-CN,zh;q=0.9"
  //   details.requestHeaders['sec-ch-ua'] = "\"Google Chrome\";v=\"149\", \"Chromium\";v=\"149\", \"Not)A;Brand\";v=\"24\""
  //   details.requestHeaders['sec-ch-ua-mobile'] = "?0"
  //   details.requestHeaders['sec-ch-ua-platform'] = "\"Windows\""
  //   details.requestHeaders['sec-fetch-dest'] = "document"
  //   details.requestHeaders['sec-fetch-mode'] = "navigate"
  //   details.requestHeaders['sec-fetch-site'] = "none"
  //   details.requestHeaders['sec-fetch-user'] = "?1"
  //   details.requestHeaders['Referer'] = 'https://www.bilibili.com/'
  //   details.requestHeaders['upgrade-insecure-requests'] = '1'
  //   delete details.requestHeaders['Origin']

  //   callback({ requestHeaders: details.requestHeaders })
  // })

  // // 拦截响应头，注入 CORS 头以绕过浏览器的跨域限制
  // session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
  //   details.responseHeaders!['Access-Control-Allow-Origin'] = ['*']
  //   details.responseHeaders!['Access-Control-Allow-Methods'] = ['GET, POST, PUT, DELETE, OPTIONS']
  //   details.responseHeaders!['Access-Control-Allow-Headers'] = ['*']
  //   callback({ responseHeaders: details.responseHeaders })
  // })

  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   const responseHeaders = details.responseHeaders || {}
  //   // 强行注入跨域允许标签
  //   responseHeaders['Access-Control-Allow-Origin'] = ['*']
  //   callback({ cancel: false, responseHeaders })
  // })

  // 允许麦克风权限（macOS 需要先通过 systemPreferences 请求）
  // session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
  //   if (permission === 'media') {
  //     callback(true)
  //   } else {
  //     callback(false)
  //   }
  // })
  // session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
  //   return permission === 'media'
  // })

  // // IPC: 渲染进程触发请求麦克风权限
  // ipcMain.handle('request-microphone-permission', async () => {
  //   if (process.platform === 'darwin') {
  //     const granted = await systemPreferences.askForMediaAccess('microphone')
  //     return granted
  //   }
  //   return true
  // })

  createWindow()

  // 注册所有 IPC 处理器
  registerIpcHandlers(mainWindow!)

  /**
   * Auto Updater
   *
   * Uncomment the following code below and install `electron-updater` to
   * support auto updating. Code Signing with a valid certificate is required.
   * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
   */
  if (!import.meta.env.DEV) {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = false

    ipcMain.on(IPC_CHECK_FOR_UPDATE, async (_event: IpcMainEvent) => {
      autoUpdater.checkForUpdates()
    })

    ipcMain.on(IPC_DOWNLOAD_UPDATE, () => {
      autoUpdater.downloadUpdate()
    })

    autoUpdater.on('update-available', () => {
      mainWindow!.webContents.send(IPC_UPDATE_AVAILABLE)
    })

    autoUpdater.on('download-progress', progress => {
      mainWindow!.webContents.send(IPC_DOWNLOAD_PROGRESS, {
        progress: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        percent: progress.percent,
        total: progress.total,
      })
    })

    autoUpdater.on('update-downloaded', () => {
      autoUpdater.quitAndInstall()
    })

    autoUpdater.on('error', error => {
      console.error(`AutoUpdate: ${error === null ? 'unknown' : (error.stack || error).toString()}`)
    })

    autoUpdater.on('update-not-available', () => {
      console.log('AutoUpdate: update-not-available')
    })
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  } else {
    mainWindow.show()
  }
})
