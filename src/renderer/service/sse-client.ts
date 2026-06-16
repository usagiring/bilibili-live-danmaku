type Handler = (data: any) => void

// preload 暴露的全局变量访问器（通过 IPC 异步获取）
const getBaseUrl = (window as any).getBaseUrl as () => Promise<string>
const getClientId = (window as any).getClientId as () => Promise<string>


class GlobalSSE {
  private es: EventSource | null = null
  private handlers = new Map<string, Handler[]>()
  private retryCount = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  /** 所有 cmd 类型的事件都会触发（用于调试/日志） */
  onAny: Handler | null = null

  get connected(): boolean {
    return this.es?.readyState === EventSource.OPEN
  }

  /** 建立 SSE 连接，通过 IPC 获取 baseUrl 和 clientId */
  async connect(): Promise<void> {
    const clientId = await getClientId()

    if (!clientId) {
      console.warn('[SSE] clientId 未注册，延迟连接...')
      this.scheduleReconnect()
      return
    }

    if (this.es) {
      this.es.close()
    }

    const baseUrl = await getBaseUrl()
    const url = `${baseUrl}/api/sse/connect?clientId=${encodeURIComponent(clientId)}`
    this.es = new EventSource(url)

    this.es.onopen = () => {
      this.retryCount = 0
      console.log('[SSE] 已连接')
    }

    this.es.onmessage = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data)
        const cmd = payload.cmd || payload.type
        if (cmd) {
          const list = this.handlers.get(cmd)
          if (list) list.forEach((fn) => fn(payload))
        }
        this.onAny?.(payload)
      } catch(e) { 
        console.log(e)
        /* ignore */ }
    }

    this.es.onerror = (e) => {
      console.log('[SSE] 连接错误，等待 EventSource 自动重连...')
      // 如果到达 CLOSED 状态（不会自动重连），才手动干预
      if (this.es?.readyState === EventSource.CLOSED) {
        // this.scheduleReconnect()
      }
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.es) {
      this.es.close()
      this.es = null
    }
  }

  /** 订阅某个 cmd 类型的消息 */
  on(cmd: string, handler: Handler): void {
    let list = this.handlers.get(cmd)
    if (!list) {
      list = []
      this.handlers.set(cmd, list)
    }
    list.push(handler)
  }

  /** 取消订阅 */
  off(cmd: string, handler: Handler): void {
    const list = this.handlers.get(cmd)
    if (!list) return
    const idx = list.indexOf(handler)
    if (idx !== -1) list.splice(idx, 1)
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    this.retryCount++
    const delay = 3000
    console.log(`[SSE] ${delay}ms 后第 ${this.retryCount} 次重连...`)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }
}

/** 全局单例 SSE 管理器 */
export const sse = new GlobalSSE()
