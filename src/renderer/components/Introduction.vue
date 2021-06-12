<template>
  <div>
    <p class="intro-img-container">
      <Poptip content="欢迎使用！" placement="left">
        <img class="intro-img" src="../assets/logo.png" />
      </Poptip>
    </p>
    <p class="intro-img-container">
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
  }
};
</script>

<style scoped>
.intro-img-container {
  text-align: center;
  padding-top: 64px;
}
.intro-img {
  filter: blur(2px);
}
.intro-img:hover {
  filter: blur(0);
}
</style>
