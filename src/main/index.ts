import { app, BrowserWindow, ipcMain, nativeImage, session, IpcMainEvent } from 'electron'
import path from 'path'
import { autoUpdater } from 'electron-updater'
import { IPC_CHECK_FOR_UPDATE, IPC_DOWNLOAD_UPDATE, IPC_UPDATE_AVAILABLE, IPC_DOWNLOAD_PROGRESS } from '../service/const'
import bilibiliBridge from '../service/bilibili-bridge'
import { initialize, enable } from '@electron/remote/main'
import { port, saveAllBiliMessage } from '../service/config-loader'
import { registerIpcHandlers } from './ipc'
import globalVar from '../service/global'

declare global {
  // eslint-disable-next-line no-var
  var __static: string
}

initialize()

process.on('uncaughtException', (error) => {
  console.log('uncaughtException')
  console.error(error)
})

/**
 * 生成 30000～50000 之间的随机端口号
 */
function getRandomPort(): number {
  return Math.floor(Math.random() * 20001) + 30000
}

/**
 * 启动 bilibili-bridge 服务
 * - 如果 config.yaml 定义了 port，优先使用配置的端口
 * - 否则在 30000～50000 中随机选择
 * - 端口被占用时自动重试，每次随机选新端口
 */
function startBilibiliBridge(maxRetries = 3): number {
  let currentPort: number = port || getRandomPort()

  for (let i = 0; i < maxRetries; i++) {
    try {
      bilibiliBridge({
        userDataPath: app.getPath('userData'),
        port: currentPort,
        saveAllBiliMessage,
      })
      console.log(`[Bridge] 服务已启动，端口: ${currentPort}`)
      return currentPort
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Bridge] 端口 ${currentPort} 被占用，随机重试...`)
        // 清除 app 模块缓存，否则 retry 时不会重新执行 app.listen()
        const appCacheKey = require.resolve('@tokine/bilibili-bridge/dist/app')
        delete require.cache[appCacheKey]
        currentPort = getRandomPort()
      } else {
        throw err
      }
    }
  }
  throw new Error(`[Bridge] 重试 ${maxRetries} 次后仍无法启动服务`)
}

const actualPort = startBilibiliBridge()
globalVar.port = actualPort
globalVar.baseUrl = `http://127.0.0.1:${actualPort}`

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
      nodeIntegration: true,
      contextIsolation: false,
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

app.on('ready', () => {

  // 视频流需要加上referer
  // Modify the user agent for all requests to the following urls.
  const filter = {
    urls: ['https://*.bilivideo.com/*']
  }

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36'
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

    autoUpdater.on('download-progress', (progress) => {
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

    autoUpdater.on('error', (error) => {
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
  }
})
