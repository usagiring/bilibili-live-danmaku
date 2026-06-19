declare module '*.vue' {
  const component: any
  export default component
}

// preload 通过 contextBridge 暴露的 API 类型
interface Window {
  getBaseUrl(): Promise<string>
  getClientId(): Promise<string>
  setClientId(clientId: string): Promise<void>
  ipcRenderer: {
    send(channel: string, ...args: unknown[]): void
    on(channel: string, func: (...args: unknown[]) => void): void
    invoke(channel: string, ...args: unknown[]): Promise<unknown>
  }
}
