import { app, BrowserWindow, ipcMain } from 'electron'
import { IPC_CHECK_FOR_UPDATE, IPC_DOWNLOAD_UPDATE, IPC_UPDATE_AVAILABLE, IPC_DOWNLOAD_PROGRESS } from '../service/const'
import '../renderer/store'
import '../service/bilibili-bridge'

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
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
    app.quit()
  })

  // mainWindow.on('close', (e) => {
  //   app.quit()
  // })

}

app.on('ready', createWindow)

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

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */


import { autoUpdater } from 'electron-updater'

app.on('ready', () => {
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