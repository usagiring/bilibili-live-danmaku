import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import path from 'path'
import { autoUpdater } from 'electron-updater'
import { IPC_CHECK_FOR_UPDATE, IPC_DOWNLOAD_UPDATE, IPC_ENABLE_WEB_CONTENTS, IPC_UPDATE_AVAILABLE, IPC_DOWNLOAD_PROGRESS, IPC_LIVE_WINDOW_PLAY, IPC_LIVE_WINDOW_CLOSE, IPC_GET_VERSION, IPC_GET_EXE_PATH, IPC_GET_USER_PATH } from '../service/const'
import '../renderer/store'
import * as bilibiliBridge from '../service/bilibili-bridge'
import { initialize, enable } from '@electron/remote/main';
initialize()

bilibiliBridge.init({
  USER_DATA_PATH: app.getPath('userData')
})

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 1200,
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
  createWindow()

  ipcMain.handle(IPC_GET_USER_PATH, async () => {
    return app.getPath('userData');
  })

  ipcMain.handle(IPC_GET_EXE_PATH, async () => {
    return app.getPath('exe');
  })

  ipcMain.handle(IPC_GET_VERSION, async () => {
    return app.getVersion()
  })

  ipcMain.handle(IPC_ENABLE_WEB_CONTENTS, async (event, data) => {
    console.log('IPC_ENABLE_WEB_CONTENTS', event, data)
    if (data.windowId) {
      enable(BrowserWindow.fromId(data.windowId).webContents)
    }
  })

  ipcMain.on(IPC_LIVE_WINDOW_PLAY, (event, data) => {
    if (data.windowId) {
      BrowserWindow.fromId(data.windowId).webContents.send(IPC_LIVE_WINDOW_PLAY, data)
    }
  })
  ipcMain.on(IPC_LIVE_WINDOW_CLOSE, (event, data) => {
    mainWindow.webContents.send(IPC_LIVE_WINDOW_CLOSE, data)
  })

  /**
   * Auto Updater
   *
   * Uncomment the following code below and install `electron-updater` to
   * support auto updating. Code Signing with a valid certificate is required.
   * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
   */
  if (process.env.NODE_ENV === 'production') {
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
