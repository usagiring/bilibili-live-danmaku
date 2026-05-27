import { contextBridge, ipcRenderer } from 'electron'
import path from 'path'

// 暴露 static 路径给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  staticPath: path.join(__dirname, '../static')
})

// 暴露 ipcRenderer 方法给渲染进程（按需添加）
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, func: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => func(...args))
  },
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
  handle: (channel: string, func: (...args: unknown[]) => Promise<unknown>) => {
    ipcRenderer.handle(channel, (_event, ...args) => func(...args))
  }
})
