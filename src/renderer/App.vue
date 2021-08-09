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
        await touch()
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
</style>
