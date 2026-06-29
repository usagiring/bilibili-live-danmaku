<template>
  <DMRaw />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DMRaw from './components/DMRaw.vue'

export default defineComponent({
  name: 'App',
  components: {
    DMRaw,
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
