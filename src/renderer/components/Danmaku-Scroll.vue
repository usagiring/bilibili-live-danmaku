<template>
  <div class="main">
    <div class="item-container">
      <span class="setting-text">显示滚动弹幕窗</span>
      <i-switch :value="isShowDanmakuWindow" :loading="isShowDanmakuWindowLoading" @on-change="showDanmakuWindow"></i-switch>
      <Checkbox :style="{'padding-left': '10px'}" :value="isScrollDanmakuWindowAlwaysOnTop" @on-change="changeAlwaysOnTop">置顶</Checkbox>
    </div>

    <div class="item-container">
      <span class="setting-text">背景色</span>
      <ColorPicker transfer :value="scrollDanmakuBackground" @on-active-change="debouncedUpdateBackground" size="small" alpha />
    </div>
    <div class="item-container">
      <span class="setting-text">透明度</span>
      <InputNumber :value="scrollDanmakuOpacity" @on-change="changeScrollDanmakuOpacity" :min="0" :max="100" :formatter="value => `${value}%`" size="small" :parser="value => value.replace('%', '')" :style="{ width: '70px' }" />
    </div>
    <div class="item-container">
      <span class="setting-text">弹幕颜色继承自普通弹幕的「内容」样式设置</span>
    </div>
    <div class="item-container">
      <span class="setting-text">整体字号</span>
      <InputNumber :value="scrollDanmakuFontSize" @on-change="changeScrollDanmakuFontSize" :min="1" size="small" :style="{ width: '55px' }" />
    </div>
    <div class="item-container">
      <span class="setting-text">弹幕显示时间</span>
      <InputNumber :value="scrollDanmakuDuration" @on-change="changeScrollDanmakuDuration" :min="0" :step="500" :formatter="value => `${value}ms`" size="small" :parser="value => value.replace('ms', '')" :style="{ width: '90px' }" />
    </div>
    <div class="item-container">
      <span class="setting-text">方向</span>
      <RadioGroup :value="scrollDanmakuDirection" @on-change="changeScrollDanmakuDirection">
        <Radio label="RL">
          <span>从右到左</span>
        </Radio>
        <Radio label="LR">
          <span>从左到右</span>
        </Radio>
      </RadioGroup>
    </div>
  </div>
</template>

<script>

import { debounce } from 'lodash'
import { PORT } from "../../service/const";
import { updateSetting } from '../../service/api'
const { BrowserWindow } = require('@electron/remote')

export default {
  data() {
    return {
      isShowDanmakuWindow: false,
      isShowDanmakuWindowLoading: false,
      isScrollDanmakuWindowAlwaysOnTop: false,
      checkOnTopInterval: null
    };
  },
  computed: {
    scrollDanmakuFontSize() {
      return this.$store.state.Config.scrollDanmakuFontSize;
    },
    scrollDanmakuDuration() {
      return this.$store.state.Config.scrollDanmakuDuration;
    },
    scrollDanmakuDirection() {
      return this.$store.state.Config.scrollDanmakuDirection;
    },
    isOnTopForce() {
      return this.$store.state.Config.isOnTopForce
    },
    scrollDanmakuWindowId() {
      return this.$store.state.Config.scrollDanmakuWindowId
    },
    scrollDanmakuWidth() {
      return this.$store.state.Config.scrollDanmakuWidth
    },
    scrollDanmakuHeight() {
      return this.$store.state.Config.scrollDanmakuHeight
    },
    scrollDanmakuX() {
      return this.$store.state.Config.scrollDanmakuX
    },
    scrollDanmakuY() {
      return this.$store.state.Config.scrollDanmakuY
    },
    scrollDanmakuBackground() {
      return this.$store.state.Config.scrollDanmakuBackground
    },
    scrollDanmakuOpacity() {
      return this.$store.state.Config.scrollDanmakuOpacity
    }
  },

  created() {
    this.debouncedUpdateBackground = debounce(this.updateBackground, 100)

    let win
    if (this.scrollDanmakuWindowId) {
      win = BrowserWindow.fromId(this.scrollDanmakuWindowId)
    }

    if (win) {
      this.win = win
      this.isShowDanmakuWindow = true
    }
  },

  methods: {
    showDanmakuWindow(status) {
      // const { x, y } = screen.getCursorScreenPoint();
      this.isShowDanmakuWindowLoading = true;

      if (status) {
        const win = new BrowserWindow({
          width: this.scrollDanmakuWidth || 480,
          height: this.scrollDanmakuHeight || 540,
          // x, y,
          x: this.scrollDanmakuX || 0,
          y: this.scrollDanmakuY || 0,
          frame: false,
          transparent: true,
          hasShadow: false,
          // webPreferences: {
          //   nodeIntegration: true,
          // },
          resizable: true,
        });

        this.$store.dispatch("UPDATE_CONFIG", {
          scrollDanmakuWindowId: win.id
        });

        const winURL = `http://localhost:${PORT}/danmaku-scroll?port=${PORT}`
        win.loadURL(winURL);
        win.on("close", (e) => {
          this.closeDanmakuWindow()
        });
        win.on("resize", debounce(() => {
          const [width, height] = win.getSize();
          this.$store.dispatch("UPDATE_CONFIG", {
            scrollDanmakuWidth: width,
            scrollDanmakuHeight: height,
          });
        }, 400))
        win.on("move", debounce(() => {
          const [x, y] = win.getPosition();
          this.$store.dispatch("UPDATE_CONFIG", {
            scrollDanmakuX: x,
            scrollDanmakuY: y,
          })
        }, 400)
        );
        this.win = win
        this.isShowDanmakuWindow = true;
        this.isShowDanmakuWindowLoading = false;
      } else {
        this.closeDanmakuWindow()
      }
    },
    async changeScrollDanmakuFontSize(value) {
      const data = {
        scrollDanmakuFontSize: value
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeScrollDanmakuDuration(value) {
      const data = {
        scrollDanmakuDuration: value
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    closeDanmakuWindow() {
      if (!this.win) return;
      this.$store.dispatch("UPDATE_CONFIG", {
        scrollDanmakuWindowId: null
      });
      // clear
      if (this.checkOnTopInterval) {
        clearInterval(this.checkOnTopInterval)
        this.checkOnTopInterval = null
      }
      this.win.close();
      this.win = null;
      this.isShowDanmakuWindow = false
      this.isShowDanmakuWindowLoading = false;
      this.isScrollDanmakuWindowAlwaysOnTop = false
    },

    changeAlwaysOnTop(status) {
      this.win.setFocusable(!status);
      // this.win.setVisibleOnAllWorkspaces(true)
      if (this.isOnTopForce && status) {
        this.checkOnTopInterval = setInterval(() => {
          if (!this.win) return
          this.win.moveTop()
        }, 1000)
      } else if (this.checkOnTopInterval) {
        clearInterval(this.checkOnTopInterval)
        this.checkOnTopInterval = null
      }
      this.win.setAlwaysOnTop(status, this.onTopLevel);
      this.win.setIgnoreMouseEvents(status, { forward: true });
      //   this.$store.dispatch("UPDATE_CONFIG", {
      //     isScrollDanmakuWindowAlwaysOnTop: status,
      //   });
      this.isScrollDanmakuWindowAlwaysOnTop = status
    },

    async updateBackground(color) {
      const data = {
        scrollDanmakuBackground: color,
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeScrollDanmakuOpacity(value) {
      const data = {
        scrollDanmakuOpacity: value
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeScrollDanmakuDirection(value) {
      const data = {
        scrollDanmakuDirection: value
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    }
  }
};
</script>

<style scoped>
.item-container {
  padding: 20px 0 0 40px;
}
.setting-text {
  vertical-align: middle;
  padding-right: 10px;
}
</style>
