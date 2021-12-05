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
import { IPC_LIVE_WINDOW_CLOSE, IPC_LIVE_WINDOW_PLAY, IPC_LIVE_WINDOW_ON_TOP } from "../../service/const";
const win = getCurrentWindow();

export default {
  data() {
    return {
      flvPlayer: null,
      videoHeight: 0,
      checkOnTopInterval: null
    };
  },
  computed: {
    liveWindowOpacity() {
      return this.$store.state.Config.liveWindowOpacity
    },
    isOnTopForce() {
      return this.$store.state.Config.isOnTopForce
    },
    onTopLevel() {
      return this.$store.state.Config.onTopLevel
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
    console.log(`live window id: ${win.id}`)

    win.on("resize", debounce(() => {
      const [width, height] = win.getSize();
      this.$store.dispatch("UPDATE_CONFIG", {
        liveWindowHeight: height,
      });
      this.videoHeight = height
    }, 500))

    win.on("move", debounce(() => {
      const [x, y] = win.getPosition();
      this.$store.dispatch("UPDATE_CONFIG", {
        liveWindowX: x,
        liveWindowY: y,
      });
    }, 500))

    document.addEventListener("keyup", function (e) {
      if (e.key === 'Escape') {
        this.closeLiveWindow()
        ipcRenderer.send(IPC_LIVE_WINDOW_CLOSE);
      }
    })

    ipcRenderer.on(IPC_LIVE_WINDOW_PLAY, (event, args) => {
      this.play({ playUrl: args.playUrl })
    })

    ipcRenderer.on(IPC_LIVE_WINDOW_CLOSE, () => {
      this.closeLiveWindow()
    });

    ipcRenderer.on(IPC_LIVE_WINDOW_ON_TOP, (event, args) => {
      this.changeAlwaysOnTop(args.status)
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
      });

      this.flvPlayer.attachMediaElement(livePlayer);
      this.flvPlayer.load();
      await this.flvPlayer.play();

      this.resize(livePlayer.offsetWidth, livePlayer.offsetHeight)
    },

    resize(width, height) {
      if (!win) return
      win.setSize(width, height)
      win.setAspectRatio(width / height)
    },

    changeAlwaysOnTop(status) {
      win.setFocusable(!status);
      // this.win.setVisibleOnAllWorkspaces(true)
      if (this.isOnTopForce && status) {
        this.checkOnTopInterval = setInterval(() => {
          if (!win) return
          win.moveTop()
        }, 1000)
      } else if (this.checkOnTopInterval) {
        clearInterval(this.checkOnTopInterval)
        this.checkOnTopInterval = null
      }
      win.setAlwaysOnTop(status, this.onTopLevel);
      // this.win.setFullScreenable(false)
      win.setIgnoreMouseEvents(status, { forward: true });
      this.$store.dispatch("UPDATE_CONFIG", {
        isLiveWindowAlwaysOnTop: status,
      });
    },

    closeLiveWindow() {
      if (!win) return;

      if (this.flvPlayer) {
        this.flvPlayer.destroy();
        this.flvPlayer = null;
      }
      win.close();

      this.$store.dispatch("UPDATE_CONFIG", {
        liveWindowId: null,
        isLiveWindowAlwaysOnTop: false,
      });
      // clear
      if (this.checkOnTopInterval) {
        clearInterval(this.checkOnTopInterval)
        this.checkOnTopInterval = null
      }
    },
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
  overflow: hidden;
}
</style>
