<template>
  <Danmaku />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Danmaku from './components/Danmaku.vue'

export default defineComponent({
  name: 'App',
  components: {
    Danmaku,
  },
})
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0px;
  overflow: hidden;
}
</style>
