import { app, BrowserWindow, dialog } from 'electron'
import '../renderer/store'

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
    height: 563,
    useContentSize: true,
    width: 1000,
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

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  // dialog.showMessageBox({
  //   type: 'info',
  //   title: 'Found Updates',
  //   message: 'Found updates, do you want update now?',
  //   buttons: ['Sure', 'No']
  // }, (buttonIndex) => {
  //   if (buttonIndex === 0) {
  //     // autoUpdater.downloadUpdate()
  //   }
  // })
  // const win = new BrowserWindow({
  //   width:  320,
  //   height:  350,
  //   // x, y,
  //   x:  0,
  //   y:  0,
  //   frame: false,
  //   transparent: true,
  //   hasShadow: false,
  //   webPreferences: {
  //     nodeIntegration: true,
  //   },
  //   resizable: true,
  // });

  // const winURL =
  //   process.env.NODE_ENV === "development"
  //     ? `http://localhost:9080/#/danmaku-window`
  //     : `file://${__dirname}/index.html#danmaku-window`;
  // win.loadURL(winURL);


  if (process.env.NODE_ENV === 'production') {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = false

    // autoUpdater.checkForUpdatesAndNotify()

    autoUpdater.on('update-available', () => {
      dialog.showMessageBox({
        type: 'info',
        title: '版本更新',
        message: '发现新版本，立即更新？',
        buttons: ['是', '否']
      }, (buttonIndex) => {
        if (buttonIndex === 0) {
          autoUpdater.downloadUpdate()
        }
      })
    })

    autoUpdater.on('error', (error) => {
      console.error(`AutoUpdate: ${error === null ? "unknown" : (error.stack || error).toString()}`)
    })

    autoUpdater.on('update-not-available', () => {
      console.log('AutoUpdate: update-not-available')
    })

    autoUpdater.on('download-progress', (progress, bytesPerSecond, percent, total, transferred) => {
      mainWindow.webContents.send('ping', 'whoooooooh!')
    })

    autoUpdater.on('update-downloaded', () => {
      autoUpdater.quitAndInstall()
    })
  }
})


// let updater
// 

// autoUpdater.on('update-available', () => {
//   dialog.showMessageBox({
//     type: 'info',
//     title: 'Found Updates',
//     message: 'Found updates, do you want update now?',
//     buttons: ['Sure', 'No']
//   }, (buttonIndex) => {
//     if (buttonIndex === 0) {
//       autoUpdater.downloadUpdate()
//     }
//     else {
//       updater.enabled = true
//       updater = null
//     }
//   })
// })

// autoUpdater.on('update-not-available', () => {
//   dialog.showMessageBox({
//     title: 'No Updates',
//     message: 'Current version is up-to-date.'
//   })
//   updater.enabled = true
//   updater = null
// })

// autoUpdater.on('update-downloaded', () => {
//   dialog.showMessageBox({
//     title: 'Install Updates',
//     message: 'Updates downloaded, application will be quit for update...'
//   }, () => {
//     setImmediate(() => autoUpdater.quitAndInstall())
//   })
// })

// // export this to MenuItem click callback
// function checkForUpdates (menuItem, focusedWindow, event) {
//   updater = menuItem
//   updater.enabled = false
//   autoUpdater.checkForUpdates()
// }
// module.exports.checkForUpdates = checkForUpdates