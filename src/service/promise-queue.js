class PromiseQueue {
  queue = []
  // channels = []
  limit = 0
  highWaterMark = 0
  current = 0
  highWaterMarkResolve = null
  waitAllResolve = null

  constructor (options = {}) {
    const { limit, highWaterMark } = options
    this.limit = limit || 32
    this.highWaterMark = highWaterMark || 0

    // this.channels = [...Array(this.limit)].map(_ => 0)
  }

  async push (fn, ...params) {
    this.queue.push({ fn, params })
    this.broker()

    if (this.highWaterMark && this.queue.length > this.highWaterMark) {
      console.log('reach high')
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

    // if (!channel && channel !== 0) {
    //   channel = this.channels.findIndex((e) => e === 0)
    //   // wait
    //   if (!~channel) return
    // }
    const item = this.queue.shift()
    if (!item) {
      return
    }

    // this.channels[channel] = 1
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
    // this.channels[channel] = 0
    this.current--

    if (this.highWaterMarkResolve && this.queue.length <= this.limit) {
      this.highWaterMarkResolve({ message: 'ok' })
    }

    if (this.waitAllResolve) {
      const hasPending = this.queue.length !== 0
      // const hasRuning = this.channels.find(c => c === 1)
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

module.exports = PromiseQueue
// how to wait all ?
// how to get all result ?
