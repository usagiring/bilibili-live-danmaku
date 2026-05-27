import { app, BrowserWindow, ipcMain, nativeImage, session, Menu, Tray } from 'electron'
import path from 'path'
import { autoUpdater } from 'electron-updater'
import { IPC_CHECK_FOR_UPDATE, IPC_DOWNLOAD_UPDATE, IPC_UPDATE_AVAILABLE, IPC_DOWNLOAD_PROGRESS } from '../service/const'
import '../renderer/store'
import bilibiliBridge from '../service/bilibili-bridge'
import { initialize, enable } from '@electron/remote/main'
import { PORT, SAVE_ALL_BILI_MESSAGE, DANMAKU_RENDER_PATH } from '../service/config-loader'
import { registerIpcHandlers } from './ipc'

initialize()

process.on('uncaughtException', (error) => {
  console.log('uncaughtException');
  console.error(error);
});

bilibiliBridge({
  USER_DATA_PATH: app.getPath('userData'),
  PORT,
  SAVE_ALL_BILI_MESSAGE,
  HTML_PATH: import.meta.env.DEV ? path.join(__dirname, '../../danmaku/dist') : DANMAKU_RENDER_PATH || path.join(__dirname, '../danmaku-dist'),
})

/**
 * Set `__static` path to static files in production
 */
if (!import.meta.env.DEV) {
  global.__static = path.join(__dirname, '../static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = import.meta.env.DEV
  ? process.env.ELECTRON_RENDERER_URL
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

  // mainWindow.on('close', (e) => {
  //   app.quit()
  // })

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
  registerIpcHandlers(mainWindow)

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
    // autoUpdater.checkForUpdatesAndNotify()

    ipcMain.on(IPC_CHECK_FOR_UPDATE, async (event) => {
      autoUpdater.checkForUpdates()
      // event.sender.send(IPC_UPDATE_AVAILABLE)
    })

    ipcMain.on(IPC_DOWNLOAD_UPDATE, () => {
      autoUpdater.downloadUpdate()
    })

    autoUpdater.on('update-available', () => {
      mainWindow.webContents.send(IPC_UPDATE_AVAILABLE)
    })

    autoUpdater.on('download-progress', (progress, bytesPerSecond, percent, total, transferred) => {
      mainWindow.webContents.send(IPC_DOWNLOAD_PROGRESS, {
        progress,
        bytesPerSecond,
        percent,
        total
      })

      // NOTE: 完成load之后再
      //   mainWindow.webContents.on('did-finish-load', function () {
      //     mainWindow.webContents.send('channelCanBeAnything', 'message');
      // });
    })

    autoUpdater.on('update-downloaded', () => {
      autoUpdater.quitAndInstall()
    })

    autoUpdater.on('error', (error) => {
      console.error(`AutoUpdate: ${error === null ? "unknown" : (error.stack || error).toString()}`)
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
