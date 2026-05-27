import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import { enable } from '@electron/remote/main'
import { BASE_URL } from '../service/config-loader'
import {
  IPC_GET_USER_PATH,
  IPC_GET_EXE_PATH,
  IPC_GET_VERSION,
  IPC_ENABLE_WEB_CONTENTS,
  IPC_LIVE_WINDOW_PLAY,
  IPC_LIVE_WINDOW_ON_TOP,
  IPC_LIVE_WINDOW_CLOSE,
  IPC_CHOOSE_DIRECTORY,
  IPC_SAVE_FILE,
} from '../service/const'

export function registerIpcHandlers(mainWindow) {

  // ---- 基础信息 ----

  ipcMain.handle(IPC_GET_USER_PATH, async () => {
    return app.getPath('userData')
  })

  ipcMain.handle(IPC_GET_EXE_PATH, async () => {
    return app.getPath('exe')
  })

  ipcMain.handle(IPC_GET_VERSION, async () => {
    return app.getVersion()
  })

  // ---- Electron Remote ----

  ipcMain.handle(IPC_ENABLE_WEB_CONTENTS, async (_event, data) => {
    if (data.windowId) {
      enable(BrowserWindow.fromId(data.windowId).webContents)
    }
  })

  // ---- 子窗口通信 ----

  ipcMain.on(IPC_LIVE_WINDOW_PLAY, (_event, data) => {
    if (data.windowId) {
      BrowserWindow.fromId(data.windowId).webContents.send(IPC_LIVE_WINDOW_PLAY, data)
    }
  })

  ipcMain.on(IPC_LIVE_WINDOW_ON_TOP, (_event, data) => {
    if (data.windowId) {
      BrowserWindow.fromId(data.windowId).webContents.send(IPC_LIVE_WINDOW_ON_TOP, data)
    }
  })

  ipcMain.on(IPC_LIVE_WINDOW_CLOSE, (_event, data) => {
    if (data.windowId) {
      BrowserWindow.fromId(data.windowId).webContents.send(IPC_LIVE_WINDOW_CLOSE, data)
    } else {
      mainWindow.webContents.send(IPC_LIVE_WINDOW_CLOSE, data)
    }
  })

  // ---- 文件操作（渲染进程委托给主进程执行） ----

  ipcMain.handle(IPC_CHOOSE_DIRECTORY, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (!result.canceled) {
      return result.filePaths[0]
    }
    return null
  })

  ipcMain.handle(IPC_SAVE_FILE, async (_event, { filePath, roomId, start, end, fileName }) => {
    const res = await axios.post(`${BASE_URL}/api/statistic/gift/export`, {
      roomId, start, end,
    }, {
      responseType: 'text',
      transitional: { forcedJSONParsing: false },
    })

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true })
    } else {
      const stat = fs.statSync(filePath)
      if (!stat.isDirectory()) {
        fs.mkdirSync(filePath, { recursive: true })
      }
    }

    const output = path.join(filePath, fileName)
    fs.writeFileSync(output, res.data)
    return true
  })
}
