<template>
  <div class="container">
    <video id="live-player" controls :style="{ height: `${videoHeight}px` }"></video>
  </div>
</template>

<script>
import { debounce } from "lodash";
import { remote, ipcRenderer } from "electron";
import * as flvjs from "flv.js";
import { IPC_LIVE_WINDOW_CLOSE, IPC_LIVE_WINDOW_PLAY } from "../../service/const";

export default {
  data() {
    return {
      win: null,
      flvPlayer: null,
      videoHeight: 0,
    };
  },
  beforeCreate() {
    document
      .getElementsByTagName("body")[0]
      .setAttribute("style", "background-color:rgba(0,0,0,0);");
  },
  mounted() {
    const win = remote.getCurrentWindow()

    const [, height] = win.getSize()
    this.videoHeight = height
    console.log(win.getSize())
    ipcRenderer.on(IPC_LIVE_WINDOW_PLAY, (event, args) => {
      this.play({ playUrl: args.playUrl })
    })

    win.on("resize", debounce(() => {
      const [width, height] = win.getSize();
      this.$store.dispatch("UPDATE_CONFIG", {
        windowWidth: width,
        windowHeight: height,
      });
    }, 500))

    win.on("move", debounce(() => {
      const [x, y] = win.getPosition();
      this.$store.dispatch("UPDATE_CONFIG", {
        windowX: x,
        windowY: y,
      });
    }, 500))

    this.win = win

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
      if (!this.win) return
      this.win.setSize(width, height)
      this.win.setAspectRatio(width / height)
    }
  }

};
</script>

<style scoped>
.container {
  opacity: 0.5;
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background: rgba(0, 0, 0, 0);
}
</style>
