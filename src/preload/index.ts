import { contextBridge, ipcRenderer } from 'electron'
// import path from 'path'
import * as api from '../service/api'
import globalVar from '../service/global'

// 暴露所有 API 方法给渲染进程
contextBridge.exposeInMainWorld('api', { ...api })

// 暴露全局变量（通过 getter 保持实时性）
// contextBridge.exposeInMainWorld('electronAPI', {
//   getBaseUrl: () => globalVar.baseUrl,
//   getPort: () => globalVar.port,
//   getClientId: () => globalVar.clientId,
//   getClientConfig: () => globalVar.clientConfig,
//   staticPath: path.join(__dirname, '../static'),
// })

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
