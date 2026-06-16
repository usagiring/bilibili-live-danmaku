import { contextBridge, ipcRenderer } from 'electron'
import globalVar from '../service/global'

contextBridge.exposeInMainWorld('getBaseUrl', () => globalVar.baseUrl)
contextBridge.exposeInMainWorld('getClientId', () => globalVar.clientId)

// 暴露 ipcRenderer 方法给渲染进程
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, func: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => func(...args))
  },
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args)
})
