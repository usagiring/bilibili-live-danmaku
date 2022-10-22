<template>
  <div id="app">
    <div id="title-bar"></div>

    <Spin fix v-if="isLoading">
      <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
      <div>Loading</div>
    </Spin>
    <div id="main-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { touch } from '../service/api'

export default {
  name: 'bilibili-danmaku',
  data() {
    return {
      isLoading: true,
      healthChecker: null,
    }
  },
  async mounted() {
    this.healthChecker = setInterval(async () => {
      try {
        await touch()
        this.isLoading = false
        clearInterval(this.healthChecker)
      } catch (e) {
        //
      }
    }, 300)
  },
}
</script>

<style>
/** global */
body {
  margin: 0;
  overflow: hidden;
}
.drop-preview {
  border: 1px dashed gray;
  border-radius: 10px;
  margin: 0 3px 0px 8px;
  height: 25px;
  display: inline-block;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
}
.disable-user-select {
  -webkit-user-select: none;
  user-select: none;
}
</style>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
#title-bar {
  height: 40px;
  -webkit-app-region: drag;
  flex: 0 0 auto;
}
#main-container {
  flex: 1 1 auto;
  overflow: auto;
}
</style>
