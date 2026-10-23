import { ipcMain, dialog, BrowserWindow, app, Tray, Menu, nativeImage, shell } from 'electron'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import { debounce } from 'lodash'
import globalVar from '../service/global'
import {
  IPC_GET_USER_PATH,
  IPC_GET_EXE_PATH,
  IPC_GET_VERSION,
  IPC_CHOOSE_DIRECTORY,
  IPC_GIFT_STATS_EXPORT,
  IPC_WINDOW_CREATE,
  IPC_GET_CURRENT_WINDOW_ID,
  IPC_WINDOW_ACTION,
  IPC_WINDOW_FIND,
  IPC_MAIN_WINDOW_ACTION,
  IPC_WINDOW_LOCATION_UPDATE,
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
  // ipcMain.handle(IPC_GET_USER_PATH, async () => {
  //   return app.getPath('userData')
  // })

  // ipcMain.handle(IPC_GET_EXE_PATH, async () => {
  //   return app.getPath('exe')
  // })

  ipcMain.handle(IPC_GET_VERSION, async () => {
    return app.getVersion()
  })

  ipcMain.handle(IPC_GET_CURRENT_WINDOW_ID, async event => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return win?.id ?? mainWindow.id
  })

  // ---- 子窗口 ----

  interface WindowMeta {
    id: number
    type: string
    roomId: string
    topLevel?: string
    win?: BrowserWindow
  }

  const windowMetaMap: Record<number, WindowMeta> = {}

  ipcMain.handle(
    IPC_WINDOW_CREATE,
    async (
      event,
      {
        hash,
        url,
        width,
        height,
        iconDataUrl,
        alwaysOnTop,
        alwaysOnTopLevel,
        skipTaskbar,
        ignoreMouseEvent,
        resizable,
        frame,
        transparent,
        hasShadow,
        type,
        roomId,
        x,
        y,
      },
    ) => {
      const winURL = url || getRendererUrl(hash)
      // 合法值只有 floating / screen-saver（关闭时 alwaysOnTop 为 false），非法值落回默认值
      const topLevel = alwaysOnTopLevel === 'screen-saver' ? 'screen-saver' : 'floating'

      const win = new BrowserWindow({
        width: width || 800,
        height: height || 600,
        webPreferences: {
          // backgroundThrottling: false,
        },
        resizable: resizable ?? true,
        frame: frame ?? true,
        transparent: transparent ?? false,
        hasShadow: hasShadow ?? true,
        skipTaskbar: skipTaskbar ?? true,
        x,
        y,
        // roundedCorners: false, // mac 自带圆角
      })

      // 构造参数 alwaysOnTop 只支持布尔，且内部写死 'floating'（会被塞到任务栏后面），
      // 所以创建后显式应用层级，保证「压住任务栏」新建即生效
      if (alwaysOnTop) win.setAlwaysOnTop(true, topLevel)

      // 防止被遮挡后定时器被降频
      // win.webContents.setBackgroundThrottling(false)

      if (ignoreMouseEvent) {
        win.setIgnoreMouseEvents(true, { forward: false })
      }

      if (iconDataUrl) {
        win.setIcon(nativeImage.createFromDataURL(iconDataUrl))
      }

      windowMetaMap[win.id] = {
        win,
        id: win.id,
        type,
        roomId,
        topLevel: alwaysOnTop ? topLevel : undefined,
      }

      const saveBounds = debounce(() => {
        if (win.isDestroyed()) return
        const bounds = win.getBounds()
        const location = {
          roomId,
          type,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        }
        mainWindow.webContents.send(IPC_WINDOW_LOCATION_UPDATE, location)
      }, 300)

      win.on('resize', saveBounds)
      win.on('moved', saveBounds)

      win.on('closed', () => {
        delete windowMetaMap[win.id]
      })

      win.loadURL(winURL)
      return { id: win.id }
    },
  )

  // 按元数据查找窗口
  ipcMain.handle(
    IPC_WINDOW_FIND,
    async (event, { id, type }: { id?: number; type?: string } = {}) => {
      const metas = getWindowMetas({ id, type })
      const result: WindowMeta[] = []
      for (const meta of metas) {
        result.push({
          ...meta,
          win: undefined,
        })
      }
      return result
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
        args,
      }: {
        id: number
        type: string
        action: 'setAlwaysOnTop' | 'setIgnoreMouseEvents' | 'setSkipTaskbar' | 'close' | 'moveTop'
        args: any[]
      },
    ) => {
      const metas = getWindowMetas({ id, type })

      for (const meta of metas) {
        const win = meta.win
        if (!win || win.isDestroyed()) continue

        if (action === 'setAlwaysOnTop') {
          const enabled = Boolean(args?.[0])
          // 白名单收敛：Windows 上只有 floating / screen-saver 两种真实行为
          const level = args?.[1] === 'screen-saver' ? 'screen-saver' : 'floating'
          if (enabled) {
            meta.topLevel = level
            win.setAlwaysOnTop(true, level)
          } else {
            meta.topLevel = undefined
            win.setAlwaysOnTop(false)
          }
        }
        if (action === 'setIgnoreMouseEvents') {
          win.setIgnoreMouseEvents(args[0], args[1])
        }
        if (action === 'setSkipTaskbar') {
          win.setSkipTaskbar(Boolean(args?.[0]))
        }
        if (action === 'close') {
          win.close()
        }
        if (action === 'moveTop') {
          win.moveTop()
        }
      }
    },
  )

  ipcMain.handle(
    IPC_MAIN_WINDOW_ACTION,
    async (event, { action }: { action: 'minimize' | 'close' | 'hide' }) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (!win) return
      if (action === 'hide') {
        win.hide()
      }
      if (action === 'minimize') {
        win.minimize()
      }
      if (action === 'close') {
        win.close()
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

  // ---- 文件对话框 ----
  // ipcMain.handle(IPC_SHOW_OPEN_DIALOG, async (_event, options) => {
  //   const result = await dialog.showOpenDialog(options)
  //   return result
  // })

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
  ipcMain.handle(
    IPC_GIFT_STATS_EXPORT,
    async (_event, { filePath, roomId, startTime, endTime, fileName }) => {
      const res = await axios.get(`${globalVar.baseUrl}/api/stats/gift/export`, {
        params: { roomId, startTime, endTime },
        responseType: 'arraybuffer',
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
    },
  )
}
