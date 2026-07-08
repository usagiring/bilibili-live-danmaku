<template>
  <div class="page">
    <!-- ═══ 语音识别 ═══ -->
    <div class="divider">语音识别</div>
    <div class="section">
      <!-- 模型配置 slot-box -->
      <div class="slot-box">
        <span class="slot-box-label">模型配置</span>
        <template v-if="!isInitialized">
          <div class="section-row">
            <span class="label">模型</span>
            <Select
              v-model="speechToTextModel"
              size="small"
              style="width: 420px"
              @on-change="saveConfig">
              <Option
                v-for="m in modelOptions"
                :key="m"
                :value="m"
                >{{ m }}</Option
              >
            </Select>
          </div>
          <div class="section-row">
            <span class="label">VAD</span>
            <span class="hint">最短语音</span>
            <input
              class="inp"
              style="width: 56px"
              v-model.number="minSpeechDuration"
              @change="saveConfig" />
            <span class="hint">秒</span>
            <span
              class="hint"
              style="margin-left: 8px"
              >静音断句</span
            >
            <input
              class="inp"
              style="width: 56px"
              v-model.number="minSilenceDuration"
              @change="saveConfig" />
            <span class="hint">秒</span>
            <span
              class="hint"
              style="margin-left: 8px"
              >最长语音</span
            >
            <input
              class="inp"
              style="width: 56px"
              v-model.number="maxSpeechDuration"
              @change="saveConfig" />
            <span class="hint">秒</span>
          </div>
          <div
            class="section-row"
            style="padding-left: 44px">
            <button
              class="btn btn-primary"
              :disabled="initializing"
              @click="initModel">
              <Icon
                v-if="initializing"
                type="ios-loading"
                size="12"
                class="spin-icon" />
              {{ initializing ? '初始化中…' : '初始化' }}
            </button>
          </div>
        </template>
        <template v-else>
          <div style="opacity: 0.5; pointer-events: none">
            <div class="section-row">
              <span class="label">模型</span>
              <span class="hint">{{ modelLabel }}</span>
            </div>
            <div class="section-row">
              <span class="label">VAD</span>
              <span class="hint"
                >最短语音 {{ minSpeechDuration }}s / 静音断句 {{ minSilenceDuration }}s / 最长语音 {{ maxSpeechDuration }}s</span
              >
            </div>
          </div>
          <div
            class="section-row"
            style="padding-left: 44px">
            <button
              class="btn"
              @click="isInitialized = false">
              修改
            </button>
          </div>
        </template>
      </div>

      <!-- 输入源 -->
      <div class="section-row">
        <span class="label">输入源</span>
        <span
          class="segmented"
          :style="{ opacity: isRecording ? 0.5 : 1, pointerEvents: isRecording ? 'none' : 'auto' }">
          <span
            class="seg-item"
            :class="{ on: audioSource === 'mic' }"
            @click="audioSource = 'mic'"
            >麦克风</span
          >
          <span
            class="seg-item"
            :class="{ on: audioSource === 'live' }"
            @click="audioSource = 'live'"
            >直播流</span
          >
        </span>
      </div>

      <!-- 操作 -->
      <div
        class="section-row"
        style="padding-left: 44px">
        <button
          v-if="!isInitialized"
          class="btn btn-disabled"
          disabled>
          ▶ 开始
        </button>
        <template v-else>
          <button
            :class="isRecording ? 'btn btn-danger' : 'btn btn-primary'"
            @click="toggleSTT">
            {{ isRecording ? '■ 停止' : '▶ 开始' }}
          </button>
          <span
            v-if="isRecording"
            class="recording-dot"></span>
        </template>
      </div>
    </div>

    <!-- 识别结果 -->
    <div style="padding: 8px 14px 0">
      <span class="hint">识别结果</span>
    </div>
    <div class="output-wrap">
      <textarea
        class="output"
        ref="outputRef"
        readonly
        :value="isInitialized ? outputText : '请先初始化模型配置'"></textarea>
    </div>

    <!-- ═══ AI 对话 ═══ -->
    <div class="divider">AI 对话</div>
    <div class="section">
      <div class="placeholder">
        <div class="ph-icon">💬</div>
        <p>接入大语言模型，智能回复弹幕</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { useConfigStore } from '../store'
import { sse } from '../service/sse-client'
import {
  speechToTextInitial,
  speechToTextDecode,
  speechToTextStatus,
  updateClientConfig,
  getPlayUrl as getPlayUrlApi,
} from '../service/api'
import config from '../service/config'
import flvjs from 'flv.js'

// ── flv 播放器 ──
let playerDOM: HTMLVideoElement | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let flvPlayer: flvjs.Player | null = null

const store = useConfigStore()
const clientId = store.id
const room = computed(() => store.activeRoom)
const roomId = computed(() => room.value?.id || '')
const isWithCookie = computed(() => config.liveConfig?.isWithCookie || false)
const cookie = computed(() => config.user?.cookie || '')

// ── Model Config ──
const speechToTextModel = ref(config.AIConfig.speechToText.model.name)
const minSpeechDuration = ref(config.AIConfig.speechToText.vad.minSpeechDuration)
const minSilenceDuration = ref(config.AIConfig.speechToText.vad.minSilenceDuration)
const maxSpeechDuration = ref(config.AIConfig.speechToText.vad.maxSpeechDuration)
const isInitialized = ref(false)
const initializing = ref(false)
const modelOptions = ref<string[]>([])

async function loadModels() {
  try {
    const models = (await window.ipcRenderer.invoke('get-speech-to-text-models')) as string[]
    modelOptions.value = models
  } catch {
    modelOptions.value = []
    speechToTextModel.value = ''
  }
}

const modelLabel = computed(() => speechToTextModel.value || '未选择')

function saveConfig() {
  config.AIConfig.speechToText.model.name = speechToTextModel.value
  config.AIConfig.speechToText.vad.minSpeechDuration = minSpeechDuration.value
  config.AIConfig.speechToText.vad.minSilenceDuration = minSilenceDuration.value
  config.AIConfig.speechToText.vad.maxSpeechDuration = maxSpeechDuration.value
  updateClientConfig({
    clientId,
    kvs: [
      { key: 'AIConfig.speechToText.model.name', value: speechToTextModel.value },
      { key: 'AIConfig.speechToText.vad.minSpeechDuration', value: minSpeechDuration.value },
      { key: 'AIConfig.speechToText.vad.minSilenceDuration', value: minSilenceDuration.value },
      { key: 'AIConfig.speechToText.vad.maxSpeechDuration', value: maxSpeechDuration.value },
    ],
  }).catch(() => {})
}

async function initModel() {
  initializing.value = true
  try {
    await speechToTextInitial({ clientId, roomId: roomId.value })
    isInitialized.value = true
  } finally {
    initializing.value = false
  }
}

// ── Audio ──
const audioSource = ref('mic')
const isRecording = ref(false)
const outputText = ref('')
const outputRef = ref<HTMLTextAreaElement | null>(null)

// ── SSE ──
onMounted(async () => {
  sse.on('SPEECH_TO_TEXT', onSpeechToText)
  await loadModels()
  const res = await speechToTextStatus({ clientId, roomId: roomId.value })
  isInitialized.value = res.data?.isReady || false
})
onBeforeUnmount(() => {
  sse.off('SPEECH_TO_TEXT', onSpeechToText)
  stopSTT()
})

let audioContext: AudioContext | null = null
let audioProcessor: ScriptProcessorNode | null = null
let micStream: MediaStream | null = null

function onSpeechToText(data: any) {
  outputText.value += `\n${data.text || ''}`
  setTimeout(() => {
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight
    }
  }, 50)
}

// 初始化 Web Audio 环境
function initAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000, // 强制要求浏览器直接重采样到 16kHz
    })
  }
  return audioContext
}

// 核心：创建音频处理器并发送到主进程
function setupAudioPipeline(sourceNode: AudioNode) {
  const ctx = initAudioContext()

  // 创建旧版或新版音频处理节点 (此处以 AudioWorklet 或 ScriptProcessor 为例，ScriptProcessor 兼容性最稳)
  audioProcessor = ctx.createScriptProcessor(4096, 1, 1) // 4096 窗口，单声道输入输出

  audioProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
    const inputData = event.inputBuffer.getChannelData(0) // 获取单声道 Float32Array (16kHz)

    speechToTextDecode({ clientId, roomId: roomId.value, buffer: inputData })
  }

  // 连接管道：音源 -> 处理器 -> 目的地（静音输出，防止回音）
  sourceNode.connect(audioProcessor)
  audioProcessor.connect(ctx.destination)
}

// =================【场景一：从麦克风获取数据】=================
async function startMic() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true, // 开启回音消除
        noiseSuppression: true, // 开启降噪
        autoGainControl: true, // 自动增益
      },
      video: false,
    })

    const ctx = initAudioContext()
    const source = ctx.createMediaStreamSource(micStream)
    setupAudioPipeline(source)
    isRecording.value = true
    console.log('麦克风实时识别已启动...')
  } catch (err: any) {
    console.error('无法获取麦克风:', err)
    if (err.name === 'NotAllowedError') {
      outputText.value +=
        '\n[提示] 开发模式下，请在 系统偏好设置 > 安全性与隐私 > 麦克风 中允许「终端」或「VS Code」。\n       如需手动打开设置，终端运行：\n       open "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone"'
    }
  }
}

// =================【场景二：从直播流获取数据】=================
async function startVideoSource() {
  // 确保有隐藏的 video 元素用来接收直播流
  if (!playerDOM) {
    playerDOM = document.createElement('video')
    playerDOM.id = 'live-video'
    playerDOM.muted = false // 静音避免回声，音频走 pipeline
    playerDOM.crossOrigin = 'anonymous'
    playerDOM.style.display = 'none'
    document.body.appendChild(playerDOM)
  }

  try {
    await startPlay()
    const ctx = initAudioContext()

    // 从直播流 video 元素创建音源
    const source = ctx.createMediaElementSource(playerDOM!)
    // 不希望用户听到声音时断开 destination，仅走 pipeline
    // source.connect(ctx.destination)
    setupAudioPipeline(source)
    isRecording.value = true
    console.log('直播流实时识别已启动...')
  } catch (err: any) {
    console.error('无法启动直播流识别:', err)
    outputText.value += `\n[错误] 直播流识别启动失败: ${err.message || ''}`
  }
}

async function getPlayUrl() {
  const { data } = await getPlayUrlApi({
    roomId: roomId.value,
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
  flvPlayer.attachMediaElement(playerDOM)
  flvPlayer.load()
  await flvPlayer.play()
}

function stopSTT() {
  if (audioProcessor) {
    audioProcessor.disconnect()
    audioProcessor = null
  }
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop())
    micStream = null
  }
  if (flvPlayer) {
    flvPlayer.pause()
    flvPlayer.unload()
    flvPlayer.detachMediaElement()
    flvPlayer.destroy()
    flvPlayer = null
  }
  if (playerDOM) {
    playerDOM.remove()
    playerDOM = null
  }
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
  isRecording.value = false
}

function toggleSTT() {
  if (isRecording.value) {
    stopSTT()
  } else if (audioSource.value === 'live') {
    startVideoSource()
  } else {
    startMic()
  }
}

// function legacy() {
//   const option: MediaStreamConstraints = {
//     audio: true,
//     video: false,
//   }
//   if (!this.audioDeviceId) {
//     option.audio = {
//       deviceId: this.audioDeviceId,
//     } as any
//   }
//   const stream = await navigator.mediaDevices.getUserMedia(option)
//   global.microphoneStream = stream
//   const context = new AudioContext({
//     sampleRate: 16000,
//   })
//   global.microphoneAudioContext = context
//   const source = context.createMediaStreamSource(stream)

//   // const processor = new Worker(new URL('../../service/processor.worklet.js', import.meta.url))
//   // await context.audioWorklet.addModule(AudioWorklet(new URL("../../service/processor.worklet.js", import.meta.url)))
//   await context.audioWorklet.addModule(processorUrl)
//   const worklet = new AudioWorkletNode(context, 'worklet-processor')

//   // let count = 0
//   let sample8192 = []
//   worklet.port.onmessage = e => {
//     let sample128 = JSON.parse(e.data)
//     sample8192 = sample8192.concat(sample128)

//     if (sample8192.length >= 16384) {
//       const payload = {
//         event: 'AUDIO',
//         data: JSON.stringify(sample8192),
//       }
//       sample8192 = []
//       // ws.send(JSON.stringify(payload))
//     }
//   }

//   source.connect(worklet)
//   worklet.connect(context.destination)
// }
</script>

<style scoped>
.page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fff;
}
.page::-webkit-scrollbar {
  width: 3px;
}
.page::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

/* ── Divider ── */
.divider {
  display: flex;
  align-items: center;
  padding: 18px 16px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}
.divider::before {
  content: '';
  width: 3px;
  height: 14px;
  background: #2d8cf0;
  border-radius: 2px;
  margin-right: 8px;
}

/* ── Section ── */
.section {
  padding: 0 14px;
}
.section-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.label {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  min-width: 36px;
  text-align: right;
}
.hint {
  font-size: 12px;
  color: #999;
}

/* ── Slot Box ── */
.slot-box {
  position: relative;
  border: 1px solid #e8eaec;
  border-radius: 6px;
  padding: 14px 10px 8px 6px;
  margin: 6px 0;
}
.slot-box-label {
  position: absolute;
  top: -8px;
  left: 10px;
  background: #fff;
  padding: 0 6px;
  font-size: 11px;
  color: #999;
}

/* ── Controls ── */
.select-native {
  height: 18px;
  border: none;
  border-bottom: 1.5px solid #ddd;
  border-radius: 0;
  font-size: 12px;
  line-height: 1;
  outline: none;
  background: transparent;
  cursor: pointer;
  color: #333;
  padding: 0 2px;
}
.select-native:focus {
  border-bottom-color: #2d8cf0;
}

.inp {
  height: 26px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 12px;
  outline: none;
  text-align: center;
}
.inp:focus {
  border-color: #2d8cf0;
}

/* ── Segmented ── */
.segmented {
  display: inline-flex;
  background: #f0f2f5;
  border-radius: 11px;
  padding: 2px;
}
.seg-item {
  height: 20px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #999;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.15s;
  user-select: none;
}
.seg-item.on {
  background: #fff;
  color: #2d8cf0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

/* ── Buttons ── */
.btn {
  height: 22px;
  border: 1px solid #2d8cf0;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  color: #2d8cf0;
  transition: 0.15s;
}
.btn:hover {
  background: rgba(45, 140, 240, 0.06);
}
.btn-primary {
  background: #2d8cf0;
  color: #fff;
  border: none;
}
.btn-primary:hover {
  background: #2b85e4;
}
.btn-danger {
  background: #ed4014;
  color: #fff;
  border-color: #ed4014;
}
.btn-danger:hover {
  background: #d83a12;
}
.btn-disabled {
  border-color: #ddd;
  color: #ccc;
  cursor: not-allowed;
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ── Recording ── */
.recording-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ed4014;
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* ── Output ── */
.output-wrap {
  padding: 0 14px 20px;
}
.output {
  width: 100%;
  height: 220px;
  padding: 10px 12px;
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.6;
  border-radius: 6px;
  overflow-y: auto;
  white-space: pre-wrap;
  border: none;
  resize: none;
}
.output::-webkit-scrollbar {
  width: 3px;
}
.output::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 10px;
}

/* ── Placeholder ── */
.placeholder {
  text-align: center;
  padding: 32px 20px;
  color: #ccc;
}
.placeholder .ph-icon {
  font-size: 28px;
  margin-bottom: 6px;
}
.placeholder p {
  font-size: 12px;
}
</style>
