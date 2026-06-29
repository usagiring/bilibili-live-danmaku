<template>
  <div class="player-container">
    <video
      id="player"
      class="full-video" />
    <!-- 中间播放/暂停按钮 + 音量 -->
    <div
      class="center-overlay"
      :class="{ 'pause-overlay': isPlaying }">
      <!-- v-if="!isPlaying" 调试 -->
      <div
        v-if="!isPlaying"
        class="play-btn"
        @click="isPlaying ? pausePlay() : startPlay()">
        <Icon
          :type="isPlaying ? 'md-pause' : 'md-play'"
          size="56"
          color="#fff" />
      </div>
      <div class="volume-wrap">
        <Icon
          type="md-volume-up"
          size="20"
          color="rgba(255,255,255,0.6)" />
        <input
          type="range"
          class="volume-slider"
          min="0"
          max="100"
          :value="currentVolume * 100"
          @input="onVolumeChange"
          @click.stop />
      </div>
    </div>
    <!-- 底部控制栏（hover 显示，仅播放后） -->
    <!-- <div
      v-if="isPlaying"
      class="bottom-bar">
      <div class="controls-row">
        <div class="danmaku-wrap">
          <Input
            v-model="message"
            placeholder="弹幕..."
            clearable
            size="small"
            :style="{ width: '260px' }"
            @on-keyup.ctrl.enter="sendMessage" />
          <Button
            :style="{ 'margin-left': '4px' }"
            size="small"
            :disabled="!message || !userCookie || !roomId"
            :loading="isSending"
            @click="sendMessage">
            发送
          </Button>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import flvjs from 'flv.js'
import axios from 'axios'
import { getClientConfig, getPlayUrl as getPlayUrlApi } from '../service/api'
import config from '../service/config'

const params = new URLSearchParams(window.location.search)
const port = params.get('port') || window.location.port || '30031'
const clientId = params.get('clientId') || ''
const roomId = params.get('roomId') || ''

const cookie = ref('')
const isWithCookie = ref(false)

const isPlaying = ref(false)
const currentVolume = ref(0.6)

// ── flv 播放器 ──
let playerDOM: HTMLVideoElement | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let flvPlayer: flvjs.Player | null = null

onMounted(async () => {
  config.baseUrl = `http://127.0.0.1:${port}`

  try {
    const { data } = await getClientConfig({ clientId })
    isWithCookie.value = data.liveConfig?.isWithCookie
    cookie.value = data.user?.cookie
  } catch {
    /* ignore */
  }

  playerDOM = document.getElementById('player') as HTMLVideoElement | null
})

onUnmounted(() => {
  if (flvPlayer) {
    flvPlayer.destroy()
    flvPlayer = null
  }
})

async function getPlayUrl() {
  const { data } = await getPlayUrlApi({
    roomId,
    qn: 400,
    withCookie: isWithCookie.value,
    clientId,
  })

  const urls = data.urls
  const url = urls[Math.floor(Math.random() * urls.length)]

  console.log(`play_url: ${url}`)

  return url
}

async function startPlay() {
  // 如果是暂停后恢复，直接 resume
  if (flvPlayer) {
    flvPlayer.play()
    isPlaying.value = true
    return
  }

  const playUrl = await getPlayUrl()

  if (!playUrl || !playerDOM) return

  if (!flvjs.isSupported()) {
    console.error('flv.js not supported')
    return
  }

  const headers: Record<string, string> = {}
  if (isWithCookie.value && cookie.value) {
    headers['cookie'] = cookie.value
  }

  flvPlayer = flvjs.createPlayer(
    {
      type: 'flv',
      url: playUrl,
      isLive: true,
      cors: true,
    },
    {
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      autoCleanupSourceBuffer: true,
    },
  )

  playerDOM.volume = currentVolume.value

  flvPlayer.attachMediaElement(playerDOM)
  flvPlayer.load()
  await flvPlayer.play()
  isPlaying.value = true
}

function pausePlay() {
  if (flvPlayer) {
    flvPlayer.pause()
    isPlaying.value = false
  }
}

function onVolumeChange(e: Event) {
  const val = Number((e.target as HTMLInputElement).value) / 100

  currentVolume.value = val
  if (playerDOM) {
    playerDOM.volume = val
  }
}

// ── 弹幕发送 ──
const message = ref('')
const isSending = ref(false)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendMessage() {
  if (!cookie.value || !roomId || !message.value) return
  isSending.value = true
  try {
    const { data } = await axios.post(
      `http://127.0.0.1:${port}/api/room/${roomId}/send-comment`,
      { comment: message.value },
      { headers: { cookie: cookie.value } },
    )
    if (data.message) {
      console.warn('发送未成功:', data.message)
    } else {
      message.value = ''
    }
  } catch (e: any) {
    console.error('发送失败:', e.message)
  } finally {
    isSending.value = false
  }
}
</script>

<style scoped>
.player-container {
  position: fixed;
  inset: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.full-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 中间播放/暂停按钮 */
.center-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 36px;
  z-index: 2;
}

.pause-overlay {
  opacity: 0;
  transition: opacity 0.2s;
}

.player-container:hover .pause-overlay {
  opacity: 1;
}

.play-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.play-btn:hover {
  background: rgba(0, 0, 0, 0.6);
}

/* 音量 */
.volume-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.4);
  padding: 8px 14px;
  border-radius: 20px;
}

.volume-slider {
  width: 140px;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  border: none;
  cursor: pointer;
}

/* 底部控制栏 */
.bottom-bar {
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.2s;
}

.player-container:hover .bottom-bar {
  opacity: 1;
}

.controls-row {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 6px 14px;
  border-radius: 20px;
}

.danmaku-wrap {
  display: flex;
  align-items: center;
}
</style>
