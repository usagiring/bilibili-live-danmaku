<template>
  <div id="app">
    <Spin fix v-if="isLoading">
      <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
      <div>Loading</div>
    </Spin>
    <router-view></router-view>
  </div>
</template>

<script>
import { touch } from '../service/api'

export default {
  name: "bilibili-danmaku",
  data() {
    return {
      isLoading: true,
      healthChecker: null,
    }
  },
  async mounted() {
    this.healthChecker = setInterval(async () => {
      try {
        const res = await touch()
        console.log(res)
        this.isLoading = false
        clearInterval(this.healthChecker)
      } catch (e) {
        // 
      }
    }, 300)
  },
};
</script>

<style>
/* CSS */
</style>
