import globalVar from './global'

type SSEMessageHandler = (data: any) => void

interface SSEClientOptions {
  /** 客户端标识，通常用房间号 */
  clientId: string
  /** 重连间隔（毫秒），默认 3000 */
  reconnectInterval?: number
  /** 最大重连次数，默认无限 */
  maxRetries?: number
  /** 连接成功回调 */
  onOpen?: () => void
  /** 连接错误回调 */
  onError?: (err: Event) => void
  /** 消息处理器 Map，按 cmd 分发 */
  handlers?: Record<string, SSEMessageHandler>
  /** 兜底消息处理 */
  onMessage?: SSEMessageHandler
}

/**
 * 对接 bridge 后端的 SSE (Server-Sent Events) 客户端
 *
 * 使用方式：
 *   const client = new SSEClient({ clientId: 'room_55609', handlers: { ... } })
 *   client.connect()
 *   // 断开时 client.disconnect()
 */
export class SSEClient {
  private es: EventSource | null = null
  private opts: SSEClientOptions
  private retryCount = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private _connected = false

  constructor(options: SSEClientOptions) {
    this.opts = {
      reconnectInterval: 3000,
      ...options,
    }
  }

  get connected(): boolean {
    return this._connected
  }

  /** 获取 SSE 连接 URL */
  private get url(): string {
    const port = globalVar.port || 30031
    return `http://127.0.0.1:${port}/api/sse/connect?clientId=${encodeURIComponent(this.opts.clientId)}`
  }

  /** 建立 SSE 连接 */
  connect(): void {
    if (this.es) {
      this.disconnect()
    }

    try {
      this.es = new EventSource(this.url)

      this.es.onopen = () => {
        this._connected = true
        this.retryCount = 0
        this.opts.onOpen?.()
      }

      this.es.onmessage = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data)
          this.dispatch(payload)
        } catch {
          // 非 JSON 消息忽略
        }
      }

      this.es.onerror = (err: Event) => {
        this._connected = false
        this.opts.onError?.(err)
        this.scheduleReconnect()
      }
    } catch (e) {
      console.error('[SSE] 连接创建失败:', e)
      this.scheduleReconnect()
    }
  }

  /** 断开 SSE 连接 */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.es) {
      this.es.close()
      this.es = null
    }
    this._connected = false
  }

  /** 重新连接 */
  reconnect(): void {
    this.disconnect()
    this.connect()
  }

  /** 注册单个消息处理器 */
  on(cmd: string, handler: SSEMessageHandler): void {
    if (!this.opts.handlers) {
      this.opts.handlers = {}
    }
    this.opts.handlers[cmd] = handler
  }

  /** 移除消息处理器 */
  off(cmd: string): void {
    if (this.opts.handlers) {
      delete this.opts.handlers[cmd]
    }
  }

  /** 向 bridge 发送消息（通过 HTTP POST，SSE 是单向的） */
  async send(endpoint: string, body: Record<string, unknown>): Promise<any> {
    const port = globalVar.port || 30031
    const url = `http://127.0.0.1:${port}/api/${endpoint}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  // ── private ──

  private dispatch(payload: any): void {
    const cmd = payload.cmd || payload.type
    if (cmd && this.opts.handlers?.[cmd]) {
      this.opts.handlers[cmd](payload)
    }
    this.opts.onMessage?.(payload)
  }

  private scheduleReconnect(): void {
    const maxRetries = this.opts.maxRetries
    if (maxRetries !== undefined && this.retryCount >= maxRetries) {
      console.error(`[SSE] 重连次数已达上限 (${maxRetries})，停止重连`)
      return
    }

    if (this.reconnectTimer) return

    this.retryCount++
    const delay = this.opts.reconnectInterval!
    console.log(`[SSE] ${delay}ms 后第 ${this.retryCount} 次重连...`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }
}
