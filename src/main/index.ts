import {
  app,
  BrowserWindow,
  ipcMain,
  session,
  IpcMainEvent,
  netLog,
  systemPreferences,
} from 'electron'
import path from 'path'
import fs from 'fs'
import { autoUpdater } from 'electron-updater'
import {
  IPC_CHECK_FOR_UPDATE,
  IPC_DOWNLOAD_UPDATE,
  IPC_UPDATE_AVAILABLE,
  IPC_DOWNLOAD_PROGRESS,
} from '../service/const'
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

process.on('uncaughtException', error => {
  console.log('uncaughtException')
  console.error(error)
})

// 1. 定义存储路径（保存在应用的数据目录下，绝对不触发钥匙串）
const clientIdPath = path.join(app.getPath('userData'), 'client_id')

// 3. 检查文件是否存在，如果不存在就创建它
if (!fs.existsSync(clientIdPath)) {
  fs.writeFileSync(clientIdPath, '', 'utf-8')
}

const clientId = fs.readFileSync(clientIdPath, 'utf-8').trim()
globalVar.clientId = clientId

// set PATH to env for bili-bridge
process.env.DB_PATH = path.join(app.getPath('userData'), 'db.sqlite')
process.env.WEB_PATH = import.meta.env.DEV
  ? path.resolve(__dirname, '../../web/dist')
  : path.join(process.resourcesPath, 'web')
process.env.MODEL_PATH = import.meta.env.DEV
  ? path.resolve(__dirname, '../models')
  : path.join(process.resourcesPath, 'models')

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
const winURL = import.meta.env.DEV
  ? process.env.ELECTRON_RENDERER_URL!
  : `file://${path.join(__dirname, '../renderer/index.html')}`

const preloadPath = path.join(__dirname, '../preload/index.cjs')

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
  mainWindow.setMenuBarVisibility(false)

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
    app.quit()
  })
}

app.on('ready', async () => {
  console.log('[Main] ready event fired')

  // 等待 bridge / 初始化完成
  try {
    await initApp()
    console.log('[Main] initApp completed, baseUrl:', globalVar.baseUrl)
  } catch (err) {
    console.error('[Main] initApp failed:', err)
  }

  // 注册渲染进程需要的 IPC handlers（必须在 createWindow 之前，避免 invoke 时无 handler）
  console.log('[Main] registering IPC handlers')
  ipcMain.handle('get-client-id', () => globalVar.clientId)
  ipcMain.handle('set-client-id', (_event, clientId: string) => {
    globalVar.clientId = clientId
    fs.writeFileSync(clientIdPath, clientId, 'utf-8')
  })
  ipcMain.handle('get-base-url', () => globalVar.baseUrl)
  ipcMain.handle('get-speech-to-text-models', () => {
    const modelsDir = import.meta.env.DEV
      ? '/Users/tokine/Tokine/bilibili-live-danmaku/models'
      : path.join(process.resourcesPath, 'models')
    try {
      const files: string[] = fs.readdirSync(modelsDir)
      return files.filter(f => f.includes('sherpa-onnx-sense-voice'))
    } catch (e) {
      console.error(e)
      return []
    }
  })

  // 视频流需要加上referer
  // Modify the user agent for all requests to the following urls.
  const filter = {
    urls: ['https://*.bilivideo.com/*'],
  }

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    // 模拟真实浏览器请求头（与 HAR 一致）
    details.requestHeaders['User-Agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'
    details.requestHeaders['Referer'] = 'https://api.live.bilibili.com/'
    callback({ requestHeaders: details.requestHeaders })
  })

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
