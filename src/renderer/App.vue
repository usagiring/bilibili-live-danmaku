<template>
  <div id="app">
    <!-- <Spin fix v-if="isLoading">
      <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
      <div>Loading</div>
    </Spin> -->
    <div id="main-container">
      <!-- <router-view></router-view> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useConfigStore } from './store'
import { touch } from '../service/api'
// import { sse } from '../service/sse-client'

let healthChecker = 0
const isLoading = ref(true)

onMounted(() => {
  // healthChecker = window.setInterval(async () => {
  //   try {
  //     await touch()
  //     isLoading.value = false
  //     clearInterval(healthChecker)

  //     // bridge 就绪后建立全局 SSE 连接
  //     sse.connect()
  //   } catch (e) { /* retry */ }
  // }, 5000)
})

onBeforeUnmount(() => {
  // sse.disconnect()
})
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

.me-ml-2px {
  margin-left: 2px;
}
.me-mr-2px {
  margin-right: 2px;
}
.padding-left-2px {
  padding-left: 2px;
}

.margin-left-2px {
  margin-left: 2px;
}

.margin-left-5px {
  margin-left: 5px;
}

.margin-left-10px {
  margin-left: 10px;
}
</style>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
#main-container {
  flex: 1 1 auto;
  overflow: auto;
}
</style>
