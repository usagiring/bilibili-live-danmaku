<template>
  <div class="container" :style="{opacity: liveWindowOpacity}">
    <video id="live-player" controls :style="{ height: `${videoHeight}px` }"></video>
  </div>
</template>

<script>
import { debounce } from "lodash";
import { ipcRenderer } from "electron";
import { getCurrentWindow } from '@electron/remote'
import * as flvjs from "flv.js";
import { IPC_LIVE_WINDOW_CLOSE, IPC_LIVE_WINDOW_PLAY } from "../../service/const";
const win = getCurrentWindow();

export default {
  data() {
    return {
      flvPlayer: null,
      videoHeight: 0,
    };
  },
  computed: {
    liveWindowOpacity() {
      return this.$store.state.Config.liveWindowOpacity
    },
  },
  beforeCreate() {
    document
      .getElementsByTagName("body")[0]
      .setAttribute("style", "background-color:rgba(0,0,0,0);");
  },
  mounted() {

    const [, height] = win.getSize()
    this.videoHeight = height
    console.log(win.getSize(), win.id)
    ipcRenderer.on(IPC_LIVE_WINDOW_PLAY, (event, args) => {
      this.play({ playUrl: args.playUrl })
    })

    win.on("resize", debounce(() => {
      const [width, height] = win.getSize();
      this.$store.dispatch("UPDATE_CONFIG", {
        windowWidth: width,
        windowHeight: height,
      });
      this.videoHeight = height
    }, 500))

    win.on("move", debounce(() => {
      const [x, y] = win.getPosition();
      this.$store.dispatch("UPDATE_CONFIG", {
        windowX: x,
        windowY: y,
      });
    }, 500))

    document.addEventListener("keyup", function (e) {
      if (e.key === 'Escape') {
        // win.close();
        ipcRenderer.send(IPC_LIVE_WINDOW_CLOSE);
      }
    })
  },
  methods: {
    async play({ playUrl }) {
      const livePlayer = document.getElementById("live-player");

      if (this.flvPlayer) {
        this.flvPlayer.destroy();
        this.flvPlayer = null;
      }

      let headers;
      if (this.isWithCookie && this.userCookie) {
        headers = {
          cookie: this.userCookie,
        };
      }
      this.flvPlayer = flvjs.createPlayer(
        {
          type: "flv",
          isLive: true,
          url: playUrl,
        },
        {
          headers,
          autoCleanupSourceBuffer: true
        }
      );

      this.flvPlayer.on(flvjs.Events.ERROR, (e) => {
        this.$Message.error(`播放失败: ${e}`);
        console.log(e)
      });

      this.flvPlayer.attachMediaElement(livePlayer);
      this.flvPlayer.load();
      await this.flvPlayer.play();

      console.log(livePlayer)
      console.log(livePlayer.offsetWidth, livePlayer.offsetHeight)
      console.log(livePlayer.videoWidth, livePlayer.videoHeight)

      this.resize(livePlayer.offsetWidth, livePlayer.offsetHeight)
    },

    resize(width, height) {
      if (!win) return
      win.setSize(width, height)
      win.setAspectRatio(width / height)
    }
  }

};
</script>

<style scoped>
.container {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background: rgba(0, 0, 0, 0);
  -webkit-app-region: drag;
}
</style>
