type Handler = (data: any) => void

// preload 暴露的全局变量访问器
const { getBaseUrl, getClientId } = (window as any).electronAPI

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

  /** 建立 SSE 连接，直接从 window 读取 baseUrl 和 clientId */
  connect(): void {
    const clientId = getClientId()
    if (!clientId) {
      console.warn('[SSE] clientId 未注册，延迟连接...')
      this.scheduleReconnect()
      return
    }

    if (this.es) {
      this.es.close()
    }

    const url = `${getBaseUrl()}/api/sse/connect?clientId=${encodeURIComponent(clientId)}`
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
      } catch { /* ignore */ }
    }

    this.es.onerror = () => {
      this.scheduleReconnect()
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
