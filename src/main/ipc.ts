import { ipcMain, dialog, BrowserWindow, app, Tray, Menu, nativeImage, shell } from 'electron'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import { enable } from '@electron/remote/main'
import globalVar from '../service/global'
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
  IPC_WINDOW_CREATE,
  IPC_WINDOW_CLOSE,
  IPC_SHOW_OPEN_DIALOG,
  IPC_GET_CURRENT_WINDOW_ID,
  IPC_WINDOW_ACTION,
  IPC_WINDOW_FIND,
} from '../service/const'

function getRendererUrl(hash: string) {
  // electron-vite 在构建时替换 import.meta.env.DEV
  if (import.meta.env.DEV) {
    return `${process.env.ELECTRON_RENDERER_URL}#${hash}`
  }
  return `file://${path.join(__dirname, '../renderer/index.html')}#${hash}`
}

export function registerIpcHandlers(mainWindow: BrowserWindow) {
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

  ipcMain.handle(IPC_GET_CURRENT_WINDOW_ID, async event => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return win?.id ?? mainWindow.id
  })

  // ---- 窗口操作 ----

  // ipcMain.handle(IPC_WINDOW_ACTION, async (event, { action }: { action: string }) => {
  //   const win = BrowserWindow.fromWebContents(event.sender)
  //   if (!win) return
  //   switch (action) {
  //     case 'minimize':
  //       win.minimize()
  //       break
  //     case 'maximize':
  //       win.maximize()
  //       break
  //     case 'unmaximize':
  //       win.unmaximize()
  //       break
  //     case 'close':
  //       win.close()
  //       break
  //     case 'hide':
  //       win.hide()
  //       break
  //     case 'show':
  //       win.show()
  //       break
  //   }
  // })

  ipcMain.handle('IPC_HIDE_TO_TRAY', async event => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    // 这里无法从渲染进程传 icon，用默认行为
    win.hide()
  })

  // ---- Electron Remote ----

  ipcMain.handle(IPC_ENABLE_WEB_CONTENTS, async (_event, data) => {
    if (data.windowId) {
      const win = BrowserWindow.fromId(data.windowId)
      if (win) enable(win.webContents)
    }
  })

  // ---- 子窗口 ----

  interface WindowMeta {
    id: number
    type: string
    win?: BrowserWindow
  }

  const windowMetaMap: Record<number, WindowMeta> = {}

  ipcMain.handle(
    IPC_WINDOW_CREATE,
    async (event, { hash, url, width, height, iconDataUrl, alwaysOnTop, resizable, frame, transparent, hasShadow, type }) => {
      const winURL = url || getRendererUrl(hash)

      const win = new BrowserWindow({
        width: width || 800,
        height: height || 600,
        type: 'toolbar',
        webPreferences: {},
        alwaysOnTop: alwaysOnTop ?? false,
        resizable: resizable ?? true,
        frame: frame ?? true,
        transparent: transparent ?? false,
        hasShadow: hasShadow ?? true,
      })

      if (iconDataUrl) {
        win.setIcon(nativeImage.createFromDataURL(iconDataUrl))
      }

      windowMetaMap[win.id] = { win, id: win.id, type }

      win.on('closed', () => {
        delete windowMetaMap[win.id]
      })

      win.loadURL(winURL)
      return { id: win.id }
    },
  )

  // 按元数据查找窗口
  ipcMain.handle(IPC_WINDOW_FIND, async (event, { id, type }: { id?: number; type?: string }) => {
    const metas = getWindowMetas({ id, type })
    const result: WindowMeta[] = []
    for (const meta of metas) {
      result.push({
        ...meta,
        win: undefined,
      })
    }
    return result
  })

  ipcMain.handle(IPC_WINDOW_CLOSE, async (event, { id: id }: { id: number }) => {
    const win = windowMetaMap[id]?.win
    if (!win || win.isDestroyed()) return
    win.close()
  })

  ipcMain.handle(
    'IPC_WINDOW_CONTROL',
    async (_event, { windowId, method, args }: { windowId: number; method: string; args?: unknown[] }) => {
      // const entry = windowMetaMap.get(windowId)
      // const win = entry?.win
      // if (!win || win.isDestroyed()) return null
      // if (method === 'getSize') return win.getSize()
      // if (method === 'getPosition') return win.getPosition()
      // if (method === 'setFocusable') return win.setFocusable(args?.[0] as boolean)
      // if (method === 'moveTop') return win.moveTop()
      // if (method === 'setAlwaysOnTop') return win.setAlwaysOnTop(args?.[0] as boolean, args?.[1] as any)
      // if (method === 'setIgnoreMouseEvents') return win.setIgnoreMouseEvents(args?.[0] as boolean, args?.[1] as any)
      // return null
    },
  )

  ipcMain.handle(
    IPC_WINDOW_ACTION,
    async (
      event,
      {
        id,
        type,
        action,
        value,
      }: {
        id: number
        type: string
        action: 'setAlwaysOnTop' | 'setIgnoreMouseEvents'
        value: any[]
      },
    ) => {
      const metas = getWindowMetas({ id, type })
      const wins = metas.map(m => m.win).filter(Boolean)

      for (const win of wins) {
        if (action === 'setAlwaysOnTop') {
          win!.setAlwaysOnTop(value[0], value[1])
        }
        if (action === 'setIgnoreMouseEvents') {
          win!.setIgnoreMouseEvents(value[0], value[1])
        }
      }
    },
  )

  function getWindowMetas({ id, type }) {
    let result = Object.values(windowMetaMap)
    if (id) {
      result = result.filter(i => i.id === id)
    }
    if (type) {
      result = result.filter(i => i.type === type)
    }
    return result
  }

  // ---- 子窗口通信 ----

  ipcMain.on(IPC_LIVE_WINDOW_PLAY, (_event, data) => {
    if (data.windowId) {
      BrowserWindow.fromId(data.windowId)?.webContents.send(IPC_LIVE_WINDOW_PLAY, data)
    }
  })

  ipcMain.on(IPC_LIVE_WINDOW_ON_TOP, (_event, data) => {
    if (data.windowId) {
      BrowserWindow.fromId(data.windowId)?.webContents.send(IPC_LIVE_WINDOW_ON_TOP, data)
    }
  })

  ipcMain.on(IPC_LIVE_WINDOW_CLOSE, (_event, data) => {
    if (data.windowId) {
      BrowserWindow.fromId(data.windowId)?.webContents.send(IPC_LIVE_WINDOW_CLOSE, data)
    } else {
      mainWindow.webContents.send(IPC_LIVE_WINDOW_CLOSE, data)
    }
  })

  // ---- 文件对话框 ----

  ipcMain.handle(IPC_SHOW_OPEN_DIALOG, async (_event, options) => {
    const result = await dialog.showOpenDialog(options)
    return result
  })

  ipcMain.handle(IPC_CHOOSE_DIRECTORY, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (!result.canceled) {
      return result.filePaths[0]
    }
    return null
  })

  // ---- 打开外部链接 ----

  ipcMain.handle('open-external', async (_event, url: string) => {
    await shell.openExternal(url)
  })

  // ---- 文件保存 ----

  ipcMain.handle(IPC_SAVE_FILE, async (_event, { filePath, roomId, start, end, fileName }) => {
    const res = await axios.post(
      `${globalVar.baseUrl}/api/statistic/gift/export`,
      {
        roomId,
        start,
        end,
      },
      {
        responseType: 'text',
        transitional: { forcedJSONParsing: false },
      },
    )

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
