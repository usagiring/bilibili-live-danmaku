import { app, BrowserWindow, ipcMain, nativeImage, session, IpcMainEvent } from 'electron'
import path from 'path'
import { autoUpdater } from 'electron-updater'
import { IPC_CHECK_FOR_UPDATE, IPC_DOWNLOAD_UPDATE, IPC_UPDATE_AVAILABLE, IPC_DOWNLOAD_PROGRESS } from '../service/const'
import '../renderer/store'
import bilibiliBridge from '../service/bilibili-bridge'
import { initialize, enable } from '@electron/remote/main'
import { port, saveAllBiliMessage } from '../service/config-loader'
import { registerIpcHandlers } from './ipc'

declare global {
  // eslint-disable-next-line no-var
  var __static: string
}

initialize()

process.on('uncaughtException', (error) => {
  console.log('uncaughtException')
  console.error(error)
})

bilibiliBridge({
  userDataPath: app.getPath('userData'),
  port,
  saveAllBiliMessage,
})

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
