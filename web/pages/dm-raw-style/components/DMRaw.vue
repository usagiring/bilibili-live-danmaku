<template>
  <div
    id="dm-raw"
    :style="{ opacity: windowOpacity, fontSize: `${fontSize}px`, background: windowBackground }">
    <div id="main"></div>
    <div id="measurer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, toRefs } from 'vue'
import { getClientConfig } from '../../service/api'
import { sse } from '../../service/sse-client'
import config from '../../service/config'
import { DmRawStyle, Message } from '@tokine/shared/types.js'

// ── data ──
const dmRawStyle = reactive<DmRawStyle>({
  isWindowAlwaysOnTop: false,
  windowOpacity: 1,
  windowBackground: 'rgba(0,0,0,0.3)',
  direction: 'RL',
  emojiSize: 60,
  styleExtend: 'bilibili',
  duration: 10000,
  ignoreMouseEvent: false,
  fontSize: 22,
})

const { windowOpacity, windowBackground, fontSize, direction, emojiSize, duration } =
  toRefs(dmRawStyle)

const comments = ref<any[]>([])
const blocks = ref<any[]>([])
const isShowType1 = ref(false)
const isShowType2 = ref(false)

const roomId = ref('')

// ── beforeCreate ──
document.getElementsByTagName('body')[0].setAttribute('style', 'background-color:rgba(0,0,0,0);')

// ── mounted ──
onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const port = params.get('port') || window.location.port || '30031'
  const clientId = params.get('clientId') || ''
  roomId.value = String(params.get('roomId') || '')

  config.set('baseUrl', `http://127.0.0.1:${port}`)

  const { data: clientConfig } = await getClientConfig({ clientId })

  if (clientConfig.dmRawStyle) {
    onRawStyle(clientConfig.dmRawStyle)
  }

  setupSSE()
  sse.connect(`http://127.0.0.1:${port}`, clientId)
})

onUnmounted(() => {})

// ── SSE ──
function setupSSE() {
  sse.on('DM_RAW_STYLE', onRawStyle)
  sse.on('MESSAGE', data => {
    if (roomId.value && roomId.value !== '*' && data.roomId !== roomId.value && data.roomId !== '*')
      return
    onMessage(data)
  })
  sse.on('MESSAGE_CLEAR', clearMessage)
}

function onRawStyle(data: DmRawStyle) {
  Object.assign(dmRawStyle, data)
}

async function getImageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = reject
    img.referrerPolicy = 'no-referrer'
    img.src = src
  })
}

function onMessage(msg: Message) {
  if (msg.category !== 'comment') return
  if (msg.type === 1 && !isShowType1.value) return
  if (msg.type === 2 && !isShowType2.value) return
  // if (msg.emots) {
  //   const regstr = Object.keys(msg.emots)
  //     .map((k: string) => k.replace(/[\[\]]/g, ''))
  //     .map((k: string) => `\\[${k}\\]`)
  //     .join('|')
  //   msg.splitContent = msg.content.split(new RegExp(`(${regstr})`, 'g')).filter(Boolean)
  // }
  dispatchComments(msg)
}

async function dispatchComments(msg: Message) {
  const { emojiUrl } = msg
  let w = 0
  let h = 0
  if (emojiUrl) {
    w = emojiSize.value
    try {
      const { width: emojiWidth, height: emojiHeight } = await getImageSize(emojiUrl)
      h = (emojiSize.value / emojiWidth) * emojiHeight
    } catch (e) {
      console.log(e)
      return
    }
  } else {
    const textSize = getTextSize({ text: msg.content })
    w = textSize.width
    h = textSize.height
  }
  const { width: windowWidth } = getWindowSize()
  const v = (w + windowWidth) / duration.value
  const { top } = getDanmakuTop({ v, height: h })
  if (top === null || top === undefined) {
    console.log('not enable space')
    return
  }

  const div = createDanmakuDOM({ comment: msg, top })

  blocks.value.push({ width: w, height: h, top, startTime: Date.now(), v })

  setTimeout(() => {
    div.remove()
    blocks.value.shift()
  }, duration.value + 500)
}

function getDanmakuTop({
  v: v2,
  top = 0,
  height,
  count = 0,
}: {
  v: number
  top?: number
  height: number
  count?: number
}): any {
  if (count > 20) return { top: null }

  const filtered = blocks.value.filter(b => b.top <= top + height && b.top + b.height > top)
  const touchedBlock = filtered.find(b => {
    const { startTime, width: bw, v: v1 } = b
    const s1 = v1 * (Date.now() - startTime) - bw
    if (s1 < 0) return true
    if (v1 - v2 >= 0) return false
    const t = s1 / (v2 - v1)
    if (t > duration.value) return false
    return true
  })

  if (!touchedBlock) return { top }
  return getDanmakuTop({
    v: v2,
    top: touchedBlock.top + touchedBlock.height,
    height,
    count: count + 1,
  })
}

function clearMessage() {
  comments.value = []
}

function getTextSize({ text }: { text: string }) {
  const measurer = document.getElementById('measurer')
  if (!measurer) return { width: 0, height: 0 }
  measurer.style.fontSize = `${fontSize.value}px`
  measurer.innerHTML = text
  return { height: measurer.clientHeight, width: measurer.clientWidth }
}

function getWindowSize() {
  const viewer = document.getElementById('dm-raw')
  if (!viewer) return { height: 0, width: 0 }
  return { height: viewer.clientHeight, width: viewer.clientWidth }
}

function createDanmakuDOM({ comment, top }: { comment: any; top: number }) {
  const { content: text, color, role, emojiUrl } = comment
  const { width: windowWidth } = getWindowSize()

  let width = 0
  let dom: HTMLElement | HTMLImageElement

  if (emojiUrl) {
    width = emojiSize.value
    dom = document.createElement('img') as HTMLImageElement
    ;(dom as HTMLImageElement).style.width = `${width}px`
    ;(dom as HTMLImageElement).src = emojiUrl
    ;(dom as HTMLImageElement).referrerPolicy = 'no-referrer'
  } else {
    const textSize = getTextSize({ text })
    width = textSize.width

    dom = document.createElement('div')
    dom.style.color = color
    dom.style.webkitTextStrokeWidth = '0.1px'
    dom.style.webkitTextStrokeColor = 'black'
    dom.innerHTML = text
  }

  dom.style.position = 'absolute'
  if (direction.value === 'RL') {
    dom.style.left = `${windowWidth}px`
  } else {
    dom.style.left = `-${width}px`
  }
  dom.style.top = `${top}px`
  dom.style.transition = `left ${duration.value / 1000}s linear 0s`
  dom.style.whiteSpace = 'nowrap'
  const mainDOM = document.getElementById('dm-raw')
  if (!mainDOM) return dom
  mainDOM.appendChild(dom)
  setTimeout(() => {
    if (direction.value === 'RL') {
      dom.style.left = `-${width}px`
    } else {
      dom.style.left = `${windowWidth}px`
    }
  }, 100)
  return dom
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#dm-raw {
  position: absolute;
  inset: 0px;
  user-select: none;
}

#main {
  position: absolute;
  inset: 4px;
  -webkit-app-region: drag;
  cursor: move;
}

#measurer {
  position: absolute;
  visibility: hidden;
  height: auto;
  width: auto;
  white-space: nowrap;
}
</style>
