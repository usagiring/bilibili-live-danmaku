type Handler = (data: any) => void

class SSEClient {
  private es: EventSource | null = null
  private handlers = new Map<string, Handler[]>()
  private retryDelay = 0
  private baseUrl = ''
  private clientId = ''

  get connected(): boolean {
    return this.es?.readyState === EventSource.OPEN
  }

  connect(baseUrl: string, clientId: string): void {
    this.baseUrl = baseUrl
    this.clientId = clientId

    if (!clientId) {
      console.warn('[SSE] clientId 为空，延迟连接...')
      setTimeout(() => this.connect(baseUrl, clientId), 2000)
      return
    }

    if (this.es) this.es.close()

    const url = `${baseUrl}/api/sse/connect?clientId=${encodeURIComponent(clientId)}`
    this.es = new EventSource(url)

    this.es.onopen = () => {
      this.retryDelay = 0
      console.log('[SSE] 已连接')
    }

    this.es.onmessage = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data)
        const cmd = payload.cmd
        if (cmd) {
          const list = this.handlers.get(cmd)
          if (list) list.forEach(fn => fn(payload))
        }
      } catch { /* ignore */ }
    }

    this.es.onerror = () => {
      if (this.es?.readyState === EventSource.CLOSED) {
        this.es = null
        this.retryDelay = Math.min(this.retryDelay + 1000, 10000)
        setTimeout(() => this.connect(this.baseUrl, this.clientId), this.retryDelay)
      }
    }
  }

  on(cmd: string, handler: Handler): void {
    const list = this.handlers.get(cmd)
    if (list) list.push(handler)
    else this.handlers.set(cmd, [handler])
  }

  off(cmd: string, handler?: Handler): void {
    if (!handler) { this.handlers.delete(cmd); return }
    const list = this.handlers.get(cmd)
    if (list) this.handlers.set(cmd, list.filter(fn => fn !== handler))
  }

  disconnect(): void {
    if (this.es) { this.es.close(); this.es = null }
    this.handlers.clear()
  }
}

export const sse = new SSEClient()
