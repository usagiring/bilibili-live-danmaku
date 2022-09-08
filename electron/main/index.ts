import { app, BrowserWindow, shell, ipcMain, nativeImage, session } from 'electron'
import { release } from 'os'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'
import { IPC_CHECK_FOR_UPDATE, IPC_DOWNLOAD_UPDATE, IPC_ENABLE_WEB_CONTENTS, IPC_UPDATE_AVAILABLE, IPC_DOWNLOAD_PROGRESS, IPC_LIVE_WINDOW_PLAY, IPC_LIVE_WINDOW_CLOSE, IPC_GET_VERSION, IPC_GET_EXE_PATH, IPC_GET_USER_PATH, IPC_LIVE_WINDOW_ON_TOP } from '../../src/service/const'
// import '../../src/renderer/store'
import * as bilibiliBridge from '../../src/service/bilibili-bridge'
import { initialize, enable } from '@electron/remote/main'

initialize()

bilibiliBridge.init({
  USER_DATA_PATH: app.getPath('userData')
})


// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export const ROOT_PATH = {
  // /dist
  dist: join(__dirname, '../..'),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
}

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL as string
const indexHtml = join(ROOT_PATH.dist, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(ROOT_PATH.public, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },

    height: 900,
    useContentSize: true,
    width: 1200,
    // webPreferences: {
    //   nodeIntegration: true,
    //   contextIsolation: false,
    // },
  })

  win.setIcon(nativeImage.createFromPath(join(__dirname, '../../build/icons/icon.ico')))
  // win.setMenuBarVisibility(false)


  if (app.isPackaged) {
    win.loadFile(indexHtml)
  } else {
    win.loadURL(url)
    // Open devTool if the app is not packaged
    console.log('12313213')
    win.webContents.openDevTools()
  }

  win.on('closed', () => {
    win = null
    app.quit()
  })

  enable(win.webContents)

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
    },
  })

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, { hash: arg })
  } else {
    childWindow.loadURL(`${url}/#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})


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

  // createWindow()

  ipcMain.handle(IPC_GET_USER_PATH, async () => {
    return app.getPath('userData')
  })

  ipcMain.handle(IPC_GET_EXE_PATH, async () => {
    return app.getPath('exe')
  })

  ipcMain.handle(IPC_GET_VERSION, async () => {
    return app.getVersion()
  })

  ipcMain.handle(IPC_ENABLE_WEB_CONTENTS, async (event, data) => {
    if (data.windowId) {
      enable(BrowserWindow.fromId(data.windowId).webContents)
    }
  })

  ipcMain.on(IPC_LIVE_WINDOW_PLAY, (event, data) => {
    if (data.windowId) {
      BrowserWindow.fromId(data.windowId).webContents.send(IPC_LIVE_WINDOW_PLAY, data)
    }
  })

  ipcMain.on(IPC_LIVE_WINDOW_ON_TOP, (event, data) => {
    if (data.windowId) {
      BrowserWindow.fromId(data.windowId).webContents.send(IPC_LIVE_WINDOW_ON_TOP, data)
    }
  })

  ipcMain.on(IPC_LIVE_WINDOW_CLOSE, (event, data) => {
    if (data.windowId) {
      BrowserWindow.fromId(data.windowId).webContents.send(IPC_LIVE_WINDOW_CLOSE, data)
    } else {
      win.webContents.send(IPC_LIVE_WINDOW_CLOSE, data)
    }
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
      win.webContents.send(IPC_UPDATE_AVAILABLE)
    })

    autoUpdater.on('download-progress', (progress, bytesPerSecond, percent, total, transferred) => {
      win.webContents.send(IPC_DOWNLOAD_PROGRESS, {
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



// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// app.on('activate', () => {
//   if (win === null) {
//     createWindow()
//   }
// })