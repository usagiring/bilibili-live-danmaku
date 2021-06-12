<template>
  <div class="help-container">
    <p>OBS浏览器捕获：http://127.0.0.1:8081</p>

    <p>关于 bug / feature：请向<span :style="{color: 'crimson', cursor: 'pointer', padding: '0 3px'}" @click="openBiliSpace">我</span>反馈</p>
    <p :style="{'padding-top': '64px'}">
      <Icon :style="{'font-size': '48px', 'cursor': 'pointer'}" type="logo-github" @click="openGithub" />
    </p>
    <p class="intro-img-container">v{{version}}</p>
  </div>
</template>

<script>
import { shell } from "electron";
import { version } from '../../service/const'
export default {
  data() {
    return {
      version
    };
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
</style>
