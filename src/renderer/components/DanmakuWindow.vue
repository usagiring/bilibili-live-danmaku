<template>
  <WindowTemplate>
    <Danmaku v-bind:isSingleWindow="true"/>
  </WindowTemplate>
</template>

<script>
import WindowTemplate from "./WindowTemplate.vue";
import Danmaku from "./Danmaku.vue";

export default {
  components: {
    WindowTemplate,
    Danmaku,
  },
};
</script>

<style scoped>
</style>
