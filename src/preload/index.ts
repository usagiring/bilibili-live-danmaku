import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('getBaseUrl', () => ipcRenderer.invoke('get-base-url'))
contextBridge.exposeInMainWorld('getClientId', () => ipcRenderer.invoke('get-client-id'))
contextBridge.exposeInMainWorld('setClientId', (clientId: string) => ipcRenderer.invoke('set-client-id', clientId))

// 暴露 ipcRenderer 方法给渲染进程
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, func: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => func(...args))
  },
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args)
})
