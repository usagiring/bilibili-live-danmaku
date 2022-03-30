<template>
  <div id="danmaku-scroll" :style="{ backgroundColor, opacity, fontSize }">
    <div id="main"> </div>
    <div id="measurer"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { getSetting, init as initAPI } from '../service/api'
import { merge, pick } from 'lodash'

// const MAX_COMMENT_COUNT = 200
// const COMMENT_QUEUE_LIMIT = 50

const STYLE_FIELDS = [
  'font-size',
  '-webkit-text-stroke-width',
  '-webkit-text-stroke-color',
  'color',
]

let ws: any

export default defineComponent({
  name: 'Danmaku',
  props: {},
  data() {
    return {
      port: '8081',
      channelHeight: 22,
      duration: 10000, // ms
      comments: [],
      commentQueue: [] as any,
      channels: [] as any,
      isShowType1: false,
      isShowType2: false,
      fontSize: '22px',
      direction: 'RL',
      backgroundColor: 'rgb(0,0,0,0)',
      opacity: 1,

      comment_lv1: {},
      comment_lv2: {},
      comment_lv3: {},
      comment_lv0: {},
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
    this.port = params.get('port') || '8081'
    initAPI({ port: this.port })
    await this.getSetting()
    // this.initChannel()

    this.ws()
    // window.addEventListener('resize', debounce(this.onResize, 500))
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

      ws.onmessage = (msg: any) => {
        const payload = JSON.parse(msg.data)
        if (payload.cmd === 'SETTING') {
          this.updateSetting(payload.payload)
        }
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

      ws.onclose = (code: number) => {
        ws = null
        console.log('ws close: ', code)
        console.log('onclose, reconnect...')
        setTimeout(() => {
          this.ws()
        }, 2000)
      }

      ws.onerror = (err: any) => {
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
      this.updateSetting(data)
    },

    updateSetting(data) {
      const {
        scrollDanmakuDuration: duration,
        scrollDanmakuFontSize: fontSize,
        scrollDanmakuDirection: direction,
        scrollDanmakuBackground: backgroundColor,
        scrollDanmakuOpacity: opacity,
        isShowType1,
        isShowType2,
        comment_lv0,
        comment_lv3,
        comment_lv2,
        comment_lv1,
      } = data
      if (duration) {
        this.duration = duration
      }
      if (fontSize) {
        this.fontSize = `${fontSize}px`
        // setTimeout(() => {
        //   this.initChannel()
        // }, 100)
      }
      if (direction) {
        this.direction = direction
      }
      if (backgroundColor) {
        this.backgroundColor = backgroundColor
      }
      if (opacity) {
        this.opacity = Number(opacity) / 100
      }
      if (isShowType1) {
        this.isShowType1 = isShowType1
      }
      if (isShowType2) {
        this.isShowType2 = isShowType2
      }

      if (comment_lv1) {
        this.comment_lv1 = merge(this.comment_lv1, pick(comment_lv1, STYLE_FIELDS))
      }
      if (comment_lv2) {
        this.comment_lv2 = merge(this.comment_lv2, pick(comment_lv2, STYLE_FIELDS))
      }
      if (comment_lv3) {
        this.comment_lv3 = merge(this.comment_lv3, pick(comment_lv3, STYLE_FIELDS))
      }
      if (comment_lv0) {
        this.comment_lv0 = merge(this.comment_lv0, pick(comment_lv0, STYLE_FIELDS))
      }
    },

    onResize() {
      // this.initChannel()
    },

    onComment({ payload: comment }: { payload: any }) {
      //   comment.category = 'comment'
      //   comment.avatar = comment.avatar ? `${comment.avatar}@48w_48h` : DEFAULT_AVATAR
      comment.role = comment.guard || comment.role
      comment.sendAt = comment.sendAt || Date.now()
      console.log(comment)
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
      // if (this.commentQueue.length > COMMENT_QUEUE_LIMIT) {
      //   this.commentQueue.shift()
      // }
      // this.commentQueue = [...this.commentQueue, comment]
      // this.dispatchComments(comment)
      this.dispatchCommentsV2(comment)
    },

    // 分配弹幕轨道，篇幅不够分配轨道的弹幕将被丢弃
    dispatchComments(comment: any) {
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
        }, this.duration + 500)
      })
    },

    dispatchCommentsV2(comment: any) {
      const { width, height } = this.getTextSize({ text: comment.content })
      const { width: windowWidth, height: windowHeight } = this.getWindowSize()
      // 弹幕速度 = （弹幕长度 + window宽度）/ DURATION
      const v = (width + windowWidth) / this.duration
      const { top, index } = this.getDanmakuTop({ v, height, windowHeight })
      if (!~index) {
        console.log('not enable channel')
        return
      } // 无可用通道
      const div = this.createDanmakuDOMV2({ text: comment.content, role: comment.role, top })

      this.channels[index] = {
        textWidth: width,
        height: height,
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
        }, this.duration + 500)
      })
    },

    clearMessage() {
      this.comments = []
    },

    getTextSize({ text }: { text: string }) {
      const measurer = document.getElementById('measurer')
      if (!measurer) return { width: 0, height: 0 }
      measurer.style.fontSize = this.fontSize
      measurer.innerHTML = text
      const height = measurer.clientHeight
      const width = measurer.clientWidth

      return { height, width }
    },

    isChannelEnable({ channelIndex, v2 }: { channelIndex: number; v2: number }) {
      const payload = this.channels[channelIndex]
      const { startTime, textWidth, v } = payload
      const s1 = v * (Date.now() - startTime) - textWidth
      if (s1 < 0) return false
      if (v - v2 === 0) return false
      const t = s1 / (v2 - v)
      if (t < 0 || t > this.duration) return true
      return false
    },

    getEnableChannel({ v }: { v: number }) {
      return this.channels.findIndex((payload: any, index: number) => {
        if (!payload) return true
        if (this.isChannelEnable({ channelIndex: index, v2: v })) {
          return true
        }
        return false
      })
    },

    // 获取新弹幕应设置的Top值
    getDanmakuTop({ v, height, windowHeight }) {
      if (!this.channels.length) return { top: 0, index: 0 }
      let top = 0

      for (let index = 0; index < this.channels.length; index++) {
        const payload = this.channels[index]
        // 如果当前轨道没有数据
        // if (!payload) return true

        // 如果当前高度大于窗口高度，计算当前轨道是否可用
        if (top + height > windowHeight) {
          if (this.isChannelEnableV2({ payload, v })) return { top, index }
          else return { top: 0, index: -1 }
        }

        // 如果待分配弹幕高度大于当前轨道弹幕高度
        if (height > payload.height) {
          // 没有下一条轨道，仅需计算当前轨道
          if (index + 1 >= this.channels.length) {
            if (this.isChannelEnableV2({ payload, v })) return { top, index }
          } else {
            // 同时计算当前轨道与下一条轨道，需同时满足条件
            if (
              this.isChannelEnableV2({ payload, v }) &&
              this.isChannelEnableV2({ payload: this.channels[index + 1], v })
            ) {
              return { top, index }
            }
          }
        } else {
          // 计算当前轨道追及
          if (this.isChannelEnableV2({ payload, v })) return { top, index }
        }

        top += payload.height
      }

      // 如果已存数据轨道遍历完之后高度依然小于窗口高度，则新建一条轨道
      return { top, index: this.channels.length }
    },

    isChannelEnableV2({ payload, v: v2 }) {
      const { startTime, textWidth, v: v1 } = payload
      const s1 = v1 * (Date.now() - startTime) - textWidth
      if (s1 < 0) return false
      if (v1 - v2 === 0) return false
      const t = s1 / (v2 - v1)
      if (t < 0 || t > this.duration) return true
      return false
    },

    // initChannel() {
    //   const { height: windowHeight } = this.getWindowSize()
    //   const { height } = this.getTextSize({ text: '中文测试' })
    //   this.channelHeight = height + 1
    //   const channelCount = Math.floor(windowHeight / this.channelHeight) || 1
    //   this.channels = [...new Array(channelCount)].map((_) => null)
    // },

    getWindowSize() {
      const viewer = document.getElementById('danmaku-scroll') //
      if (!viewer) return { height: 0, width: 0 }
      return {
        height: viewer.clientHeight,
        width: viewer.clientWidth,
      }
    },

    createDanmakuDOM({ text, channelIndex }: { text: string; channelIndex: number }) {
      const div = document.createElement('div')
      const { width: windowWidth, height } = this.getWindowSize()
      const { width } = this.getTextSize({ text })
      div.style.color = 'black'
      div.style.position = 'absolute'
      div.style.left = windowWidth + 'px'
      div.style.top = `${this.channelHeight * channelIndex}px`
      console.log(
        this.channelHeight,
        channelIndex,
        `${this.channelHeight * channelIndex}px`,
        this.channels.length
      )
      div.innerHTML = text
      div.style.transition = `left ${this.duration / 1000}s linear 0s`
      div.style.whiteSpace = 'nowrap'
      const mainDOM = document.getElementById('danmaku-scroll')
      if (!mainDOM) return div
      mainDOM.appendChild(div)
      setTimeout(() => {
        div.style.left = `-${width}px`
      }, 100)
      return div
    },

    createDanmakuDOMV2({ text, top, role }: { text: string; top: number; role: number }) {
      const div = document.createElement('div')
      const { width: windowWidth, height } = this.getWindowSize()
      const { width } = this.getTextSize({ text })
      div.style.color = 'black'
      const roleStyle = this[`comment_lv${role}`]
      div.style.color = roleStyle?.color || 'black'
      // div.style.fontSize = roleStyle?.['font-size'] || this.fontSize
      div.style.webkitTextStrokeWidth = roleStyle?.['-webkit-text-stroke-width'] || '0px'
      div.style.webkitTextStrokeColor = roleStyle?.['-webkit-text-stroke-color'] || 'black'

      div.style.position = 'absolute'
      if (this.direction === 'RL') {
        div.style.left = `${windowWidth}px`
      } else {
        div.style.left = `-${width}px`
      }
      div.style.top = `${top}px`
      div.innerHTML = text
      div.style.transition = `left ${this.duration / 1000}s linear 0s`
      div.style.whiteSpace = 'nowrap'
      const mainDOM = document.getElementById('danmaku-scroll')
      if (!mainDOM) return div
      mainDOM.appendChild(div)
      setTimeout(() => {
        if (this.direction === 'RL') {
          div.style.left = `-${width}px`
        } else {
          div.style.left = `${windowWidth}px`
        }
      }, 100)
      return div
    },
  },
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#danmaku-scroll {
  position: absolute;
  inset: 0px;
  user-select: none;
}

#main {
  position: absolute;
  inset: 4px;
  -webkit-app-region: drag;
  cursor: pointer;
}

#measurer {
  position: absolute;
  visibility: hidden;
  height: auto;
  width: auto;
  white-space: nowrap;
}
</style>
