<template>
  <div class="speech-to-text disable-user-select">
    <Alert show-icon>请确认Cookie、AliSdk已正确设置，保持环境安静，使用英语确认发送、清空弹幕</Alert>
    <br />
    <Row justify="center">
      <!-- <Col span="1"> -->
      <Icon v-if="!isLoading" class="main-icon" type="ios-radio-button-off" />
      <Icon v-if="isLoading" type="ios-loading" class="ivu-anim-loop" size="50" />
      <!-- </Col> -->
    </Row>
    <br />
    <Row justify="center">
      <!-- <Col span="24"> -->
      <Input v-model="message" prefix="ios-mic-outline" maxlength="30" show-word-limit style="width: 550px" />
      <!-- </Col> -->
    </Row>
    <br />
    <Row justify="center">
      <!-- <Col span="8"> -->
      <Button :style="{ margin: '0 10px' }" type="primary" @click="sendMessage">
        <Icon size="16" type="ios-mic-outline" />
        Confirm
      </Button>
      <!-- </Col> -->
      <!-- <Col span="8"> -->
      <Button :style="{ margin: '0 10px' }" @click="cancel">
        <Icon size="16" type="ios-mic-outline" />
        Cancel
      </Button>
      <!-- </Col> -->
    </Row>
  </div>
</template>

<script>
import { reactive } from 'vue'
import ws from '../../service/ws'
import { speechToText } from '../../service/api'
import { sendMessage } from '../../service/bilibili-api'

// 依赖过大50mb 放弃使用
// import * as vad from '@ricky0123/vad'
// import vad2 from 'voice-activity-detection'
import vad3 from '../../service/vad'
import processor from 'worklet-loader!../../service/processor.worklet'

/**
 * @description 开发环境开启以下配置
 */
// import { env } from 'onnxruntime-web'
// env.wasm.wasmPaths = window.location.protocol === 'file:' ? window.location.href.substring(0, window.location.href.indexOf('app.asar')) : ''

let isVoiceActive = false

export default {
  setup() {
    return reactive({
      message: '',
      isLoading: false,
    })
  },

  computed: {
    aliAppKey() {
      return this.$store.state.Config.aliAppKey
    },
    realRoomId() {
      return this.$store.state.Config.realRoomId
    },
    userCookie() {
      return this.$store.state.Config.userCookie
    },
  },

  beforeCreate() {
    // document.getElementsByTagName('body')[0].setAttribute('style', 'background-color:rgba(0,0,0,0.2);')
  },

  created() {
    ws.addEventListener('message', this.onMessage)
  },

  async mounted() {
    // vad.MicVAD.new({
    //   onSpeechStart: () => {
    //     console.log('Speech start detected')
    //     this.isLoading = true
    //   },
    //   onSpeechEnd: (audio) => {
    //     if (audio.length > 300000) {
    //       this.isLoading = false
    //       return
    //     }
    //     const pcmData = new Int16Array(audio.length)

    //     // 32bit to 16bit
    //     for (let i = 0; i < audio.length; i++) {
    //       let s = Math.max(-1, Math.min(1, audio[i]))
    //       s = s < 0 ? s * 0x8000 : s * 0x7fff
    //       pcmData[i] = s
    //     }
    //     this.isLoading = false
    //     // speechToText({ appKey: this.aliAppKey, payload: JSON.stringify(Array.from(pcmData)) })
    //     // do something with `audio` (Float32Array of audio samples at sample rate 16000)...
    //   },
    // }).then((myvad) => {
    //   myvad.start()
    // })

    this.requestMic()
  },

  beforeUnmount() {
    ws.removeEventListener('message', this.onMessage)
  },

  methods: {
    async requestMic() {
      const self = this

      try {
        // window.AudioContext = window.AudioContext || window.webkitAudioContext
        // audioContext = new AudioContext()

        // navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
        // navigator.getUserMedia({ audio: true }, this.startUserMedia, this.handleMicConnectError)

        const option = {
          audio: true,
          video: false,
        }
        // if (!this.audioDeviceId) {
        //   option.audio = {
        //     deviceId: this.audioDeviceId,
        //   }
        // }
        const context = new AudioContext({
          sampleRate: '16000',
        })
        const stream = await navigator.mediaDevices.getUserMedia(option)
        // this.startUserMedia(context, stream)

        const source = context.createMediaStreamSource(stream)
        var options = {
          source: source,
          voice_stop: function () {
            console.log('voice_stop')
            isVoiceActive = false
            self.isLoading = false
          },
          voice_start: function () {
            console.log('voice_start')
            isVoiceActive = true
            self.isLoading = true
          },
        }

        // Create VAD
        var vad = new vad3(options)

        // const processor = new Worker(new URL('../../service/processor.worklet.js', import.meta.url))
        // await context.audioWorklet.addModule(AudioWorklet(new URL("../../service/processor.worklet.js", import.meta.url)))
        await context.audioWorklet.addModule(processor)
        const worklet = new AudioWorkletNode(context, 'worklet-processor')

        // let count = 0
        let sample = []
        let voiceRaw = []

        let isSendThisPak = false
        worklet.port.onmessage = (e) => {
          let sample128 = JSON.parse(e.data)
          sample = sample.concat(sample128)

          if (isVoiceActive) {
            isSendThisPak = true
          }

          if (sample.length >= 8192) {
            if (isSendThisPak && voiceRaw.length < 300000) {
              voiceRaw = voiceRaw.concat(sample)
            }

            if (!isSendThisPak) {
              console.log('voiceRaw', voiceRaw.length)
              if (voiceRaw.length && voiceRaw.length < 300000) {
                speechToText({ appKey: this.aliAppKey, payload: JSON.stringify(voiceRaw) })
              }
              voiceRaw = []
            }

            sample = []
            isSendThisPak = false
          }
        }

        source.connect(worklet)
        worklet.connect(context.destination)
      } catch (e) {
        this.handleUserMediaError()
        throw e
      }
    },

    handleUserMediaError() {
      console.warn('Mic input is not supported by the browser.')
    },

    handleMicConnectError() {
      console.warn('Could not connect microphone. Possible rejected by the user or is blocked by the browser.')
    },

    startUserMedia(audioContext, stream) {
      const self = this
      var options = {
        noiseCaptureDuration: 200,
        smoothingTimeConstant: 0.1,
        minNoiseLevel: 0.3,
        maxNoiseLevel: 0.7,
        avgNoiseMultiplier: 1.2,
        onVoiceStart: function () {
          console.log('voice start')
          isVoiceActive = true
          self.isLoading = true
        },
        onVoiceStop: function () {
          console.log('voice stop')
          isVoiceActive = false
          self.isLoading = false
        },
        onUpdate: function (val) {},
      }
      vad2(audioContext, stream, options)
    },

    onMessage(msg) {
      const payload = JSON.parse(msg.data)

      if (payload.cmd === 'SR_STARTED') {
      }

      if (payload.cmd === 'SR_COMPLETED') {
        if (payload.payload?.payload?.result === 'Confirm') {
          this.sendMessage()
          return
        }
        if (payload.payload?.payload?.result === 'Cancel') {
          this.cancel()
          return
        }

        this.message = this.message + payload.payload?.payload?.result
        this.message = this.message.slice(0, 30)
      }
    },

    async sendMessage() {
      if (!this.userCookie || !this.realRoomId || !this.message) return
      this.isSending = true
      try {
        const result = await sendMessage(
          {
            message: this.message,
            roomId: this.realRoomId,
            color: 16777215,
            fontsize: 25,
            mode: 1,
            bubble: 0,
          },
          this.userCookie
        )
        if (result.data.message) {
          this.$Message.warning(`发送未成功: ${result.data.message}`)
          return
        }
        this.message = ''
      } catch (e) {
        this.$Message.error(`发送失败: ${e.message}`)
      } finally {
        this.isSending = false
      }
    },

    cancel() {
      this.message = ''
    },
  },
}
</script>

<style scoped>
.main-icon {
  font-size: 50px;
}
</style>
