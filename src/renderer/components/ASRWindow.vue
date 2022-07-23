<template>
  <div class="asr-window">
    <div id="main">
      <template v-for="(text, index) in texts">
        <div class="text" :key="index">{{ text }}</div>
      </template>
    </div>
  </div>
</template>

<script>
import ws from '../../service/ws'

export default {
  data() {
    return {
      texts: [],
      currentTextIndex: 0,
    };
  },

  computed: {
    ASRWindowId() {
      return this.$store.state.Config.ASRWindowId;
    },
    ASRLineCount() {
      return this.$store.state.Config.ASRLineCount
    }
  },

  beforeCreate() {
    document
      .getElementsByTagName('body')[0]
      .setAttribute('style', 'background-color:rgba(0,0,0,0.2);')
  },

  created() {
    ws.addEventListener('message', this.onMessage)
  },

  beforeDestroy() {
    ws.removeEventListener("message", this.onMessage);
  },

  methods: {
    onMessage(msg) {
      const payload = JSON.parse(msg.data)

      if (payload.cmd === 'ASR_SENTENCE_BEGIN') {
        if (this.texts.length >= this.ASRLineCount) {
          this.texts = this.texts.slice(this.texts.length - this.ASRLineCount + 1)
          this.currentTextIndex = this.ASRLineCount - 1
        } else {
          this.currentTextIndex = this.texts.length
        }
      }

      if (payload.cmd === 'ASR_SENTENCE_END') {
        const texts = [...this.texts]
        texts[this.currentTextIndex] = payload.payload?.payload?.result
        this.texts = texts
      }

      if (payload.cmd === 'ASR_SENTENCE_CHANGE') {
        const texts = [...this.texts]
        texts[this.currentTextIndex] = payload.payload?.payload?.result
        this.texts = texts
      }
    },
  }
};
</script>

<style scoped>
.asr-window {
  position: absolute;
  inset: 0px;
  user-select: none;
  overflow-y: auto;
}

.asr-window::-webkit-scrollbar {
  display: none;
}

#main {
  position: absolute;
  inset: 4px;
  -webkit-app-region: drag;
  cursor: move;
}

.text {
  text-align: center;
  color: white;
  font-size: 18px;
  /* -webkit-text-stroke-width: 0.5px;
  -webkit-text-stroke-color: black; */
  text-shadow: black 1px 0 0, black 0 1px 0, black -1px 0 0, black 0 -1px 0;
}
</style>
