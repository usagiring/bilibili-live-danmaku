<template>
  <div id="danmaku-scroll" class="danmaku-scroll">
    <div id="main"> </div>
    <div id="measurer" class="measurer"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { getSetting, init as initAPI } from '../service/api'
import { debounce } from 'lodash'

const MAX_COMMENT_COUNT = 200
const CHANNEL_HEIGHT = 22
const COMMENT_QUEUE_LIMIT = 50

let ws

export default defineComponent({
  name: 'Danmaku',
  props: {},
  data() {
    return {
      port: 8081,
      duration: 10000, // ms
      comments: [],
      commentQueue: [],
      channels: [],
    }
  },
  //   setup() {
  //     document
  //       .getElementsByTagName('body')[0]
  //       .setAttribute('style', 'background-color:rgba(0,0,0,0);')
  //   },

  beforeCreate() {
    document
      .getElementsByTagName('body')[0]
      .setAttribute('style', 'background-color:rgba(0,0,0,0);')
  },

  //   beforeDestroy() {
  //     window.removeEventListener('resize', )
  //   },

  async mounted() {
    const params = new URLSearchParams(window.location.search)
    this.port = params.get('port') || 8081
    initAPI({ port: this.port })
    await this.getSetting()
    this.initChannel()

    this.ws()
    window.addEventListener('resize', debounce(this.onResize, 500))
  },

  methods: {
    ws() {
      const WS_URL = `ws://127.0.0.1:${this.port}`
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('connected..., nothing todo.')
        return
      }
      if (ws && ws.readyState === WebSocket.CONNECTING) {
        console.log('connecting..., nothing todo.')
        return
      }

      ws = new WebSocket(WS_URL)
      ws.onopen = () => {
        console.log('onopen, connected...')
      }

      ws.onmessage = (msg) => {
        const payload = JSON.parse(msg.data)
        // if (payload.cmd === 'SETTING') {
        //   this.onSetting(payload.payload)
        // }
        if (payload.cmd === 'COMMENT') {
          this.onComment(payload)
        }
        // if (payload.cmd === (this.isExample ? 'EXAMPLE_GIFT' : 'GIFT')) {
        //   this.onGift(payload.payload)
        // }
        // if (
        //   payload.cmd === (this.isExample ? 'EXAMPLE_INTERACT' : 'INTERACT')
        // ) {
        //   this.onInteract(payload.payload)
        // }
        // if (
        //   payload.cmd === (this.isExample ? 'EXAMPLE_SUPER_CHAT' : 'SUPER_CHAT')
        // ) {
        //   this.onSuperChat(payload.payload)
        // }

        if (payload.cmd === 'MESSAGE_CLEAR') {
          this.clearMessage()
        }
      }

      ws.onclose = (code) => {
        ws = null
        console.log('ws close: ', code)
        console.log('onclose, reconnect...')
        setTimeout(() => {
          this.ws()
        }, 2000)
      }

      ws.onerror = (err) => {
        ws = null
        console.error(err)
        console.log('onerror, reconnect...')
        setTimeout(() => {
          this.ws()
        }, 2000)
      }
    },

    async getSetting() {
      const { data } = await getSetting()
      for (const key in data) {
        this[key] = data[key]
      }
    },

    onResize() {
      this.initChannel()
    },

    onComment({ payload: comment }) {
      //   comment.category = 'comment'
      //   comment.avatar = comment.avatar ? `${comment.avatar}@48w_48h` : DEFAULT_AVATAR
      comment.role = comment.guard || comment.role
      comment.sendAt = comment.sendAt || Date.now()
      if (comment.type === 1 && !this.isShowType1) {
        return
      }
      if (comment.type === 2 && !this.isShowType2) {
        return
      }

      //   if (this.combineSimilarTime) {
      //     const reverseComments = [...this.comments].reverse()
      //     for (const comment of reverseComments) {
      //       // 再之前的消息超过时间范围，直接跳出
      //       if (comment.sendAt < Date.now() - this.combineSimilarTime) break
      //       if (comment.content === comment.content) {
      //         comment.similar = (comment.similar || 0) + 1
      //         return
      //       }
      //     }
      //   }

      //   if (this.comments.length > MAX_COMMENT_COUNT) {
      //     this.comments.shift()
      //   }
      //   this.comments = [...this.comments, comment]
      if (this.commentQueue.length > COMMENT_QUEUE_LIMIT) {
        this.commentQueue.shift()
      }
      this.commentQueue = [...this.commentQueue, comment]
      this.dispatchComments(comment)
    },

    // 分配弹幕轨道，篇幅不够分配轨道的弹幕将被丢弃
    dispatchComments(comment) {
      const { width } = this.getTextSize({ text: comment.content })
      const { width: windowWidth } = this.getWindowSize()
      // 弹幕速度 = （弹幕长度 + window宽度）/ DURATION
      const v = (width + windowWidth) / this.duration
      const enableChannel = this.getEnableChannel({ v })
      if (!~enableChannel) {
        console.log('not enable channel')
        return
      } // 无可用通道
      const div = this.createDanmakuDOM({ text: comment.content, channelIndex: enableChannel })

      this.channels[enableChannel] = {
        textWidth: width,
        startTime: Date.now(),
        v,
      }
      // 解除通道占用需要行过一个弹幕长度
      //   const t = width / v
      // 解除通道占用
      //   new Promise((resolve, reject) => {
      //     setTimeout(() => {
      //       this.channels[enableChannel] = 0
      //       resolve(null)
      //     }, t)
      //   })
      // 弹幕消失
      new Promise((resolve, reject) => {
        setTimeout(() => {
          div.remove()
          resolve(null)
        }, this.duration)
      })
    },

    clearMessage() {
      this.comments = []
    },

    getTextSize({ text }) {
      const fontSize = '14'
      const measurer = document.getElementById('measurer')
      measurer.style.fontSize = fontSize
      measurer.innerHTML = text
      const height = measurer.clientHeight
      const width = measurer.clientWidth

      return { height, width }
    },

    isChannelEnable({ channelIndex, v2 }) {
      const payload = this.channels[channelIndex]
      const { startTime, textWidth, v } = payload
      const s1 = v * (Date.now() - startTime) - textWidth
      if (s1 < 0) return false
      if (v - v2 === 0) return false
      const t = s1 / (v2 - v)
      if (t < 0 || t > this.duration) return true
      return false
    },

    getEnableChannel({ v }) {
      return this.channels.findIndex((payload, index) => {
        if (!payload) return true
        if (this.isChannelEnable({ channelIndex: index, v2: v })) {
          return true
        }
        return false
      })
    },

    initChannel() {
      const { height } = this.getWindowSize()
      const channelCount = Math.floor(height / CHANNEL_HEIGHT) || 1
      this.channels = [...new Array(channelCount)].map((_) => null)
    },

    getWindowSize() {
      const viewer = document.getElementById('danmaku-scroll') //
      return {
        height: viewer.clientHeight,
        width: viewer.clientWidth,
      }
    },

    createDanmakuDOM({ text, channelIndex }) {
      const div = document.createElement('div')
      //   div.style.width = '100px'
      //   div.style.height = '100px'
      const { width: windowWidth, height } = this.getWindowSize()
      const { width } = this.getTextSize({ text })
      //   div.style.background = 'red'
      div.style.color = 'black'
      div.style.position = 'absolute'
      div.style.left = windowWidth + 'px'
      div.style.top = `${CHANNEL_HEIGHT * channelIndex}px`
      div.innerHTML = text
      div.style.transition = `left ${this.duration / 1000}s linear 0s`
      div.style.whiteSpace = 'nowrap'
      //   div.style.transform = `translateX(-${windowWidth}px)`
      document.getElementById('danmaku-scroll').appendChild(div)
      setTimeout(() => {
        div.style.left = `-${width}px`
        //    div.style.left = `0px`
      }, 100)
      return div
    },
  },
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.danmaku-scroll {
  position: 'absolute';
  top: '0px';
  bottom: '0px';
  left: '0px';
  right: '0px';
  height: 100%;
  overflow: hidden;
}

.main-container {
  position: 'absolute';
  top: '4px';
  bottom: '4px';
  left: '4px';
  right: '4px';
  user-select: 'none';
}

.measurer {
  position: absolute;
  visibility: hidden;
  height: auto;
  width: auto;
  white-space: nowrap;
}

/* @keyframes moveToLeft {
  0% {
    transform: translateX(0px);
  }
  100% {
    transform: translateX(-${windowWidth}px);
  }
} */
</style>
