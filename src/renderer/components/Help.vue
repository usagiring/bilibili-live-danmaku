<template>
  <div class="help-container">
    <p>CTRL + R 刷新</p>
    <p>OBS浏览器捕获URL：http://127.0.0.1:8081</p>
    <!-- <p>OBS浏览器滚动弹幕捕获URL：http://127.0.0.1:8081/danmaku-scroll</p> -->

    <p>关于 bug / feature：请向<span :style="{color: 'crimson', cursor: 'pointer', padding: '0 3px'}" @click="openBiliSpace">@其妙</span>反馈</p>
    <p :style="{'padding-top': '64px'}">
      <Icon :style="{'font-size': '48px', 'cursor': 'pointer'}" type="logo-github" @click="openGithub" />
    </p>
    <p class="intro-img-container">v{{version}}</p>
  </div>
</template>

<script>
import { ipcRenderer, shell } from "electron";
import { IPC_GET_VERSION } from '../../service/const'
export default {
  data() {
    return {
      version: 0
    };
  },
  async mounted() {
    this.version = await ipcRenderer.invoke(IPC_GET_VERSION);
  },
  methods: {
    openGithub() {
      shell.openExternal(`https://github.com/usagiring/bilibili-live-danmaku`);
    },
    openBiliSpace() {
      shell.openExternal(`https://space.bilibili.com/55609`);
    },
  }
};
</script>

<style scoped>
.help-container {
  text-align: center;
  padding-top: 30px;
}

.help-container > p {
  padding: 5px;
}
</style>
