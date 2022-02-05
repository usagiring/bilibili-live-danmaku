class PromiseQueue {
  queue = []
  limit = 0
  highWaterMark = 0
  current = 0
  highWaterMarkResolve = null
  waitAllResolve = null

  constructor (options = {}) {
    const { limit, highWaterMark } = options
    this.limit = limit || 32
    this.highWaterMark = highWaterMark || 0
  }

  async push (fn, ...params) {
    this.queue.push({ fn, params })
    this.broker()

    if (this.highWaterMark && this.queue.length > this.highWaterMark) {
      return new Promise((resolve, reject) => {
        this.highWaterMarkResolve = resolve
      })
    } else {
      return { message: 'ok' }
    }
  }

  broker (channel) {
    if (this.current === this.limit) {
      return
    }

    const item = this.queue.shift()
    if (!item) {
      return
    }

    this.current++
    this.run({ fn: item.fn, params: item.params })
      .then((result) => {
        if (this.pipeFn) {
          this.pipeFn(result)
        }
      }, (error) => {
        if (this.catchFn) {
          this.catchFn(error)
        } else {
          console.error(error)
        }
      })
      .catch(error => {
        console.error(error)
      })
      .finally(() => {
        this.processed(channel)
        this.broker(channel)
      })
  }

  run ({ fn, params }) {
    return fn(...params)
  }

  processed () {
    // release channel
    this.current--

    if (this.highWaterMarkResolve && this.queue.length <= this.limit) {
      this.highWaterMarkResolve({ message: 'ok' })
    }

    if (this.waitAllResolve) {
      const hasPending = this.queue.length !== 0
      const hasRuning = this.current > 0
      if (!hasPending && !hasRuning) {
        this.waitAllResolve()
      }
    }
  }

  pipe (callback) {
    this.pipeFn = callback
  }

  catch (catchFn) {
    this.catchFn = catchFn
  }

  async waitAll () {
    return new Promise((resolve, reject) => {
      this.waitAllResolve = resolve
    })
  }
}

export default PromiseQueue
