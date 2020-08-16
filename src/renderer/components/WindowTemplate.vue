<template>
  <div class="container" :style="{ background: background }">
    <slot></slot>
  </div>
</template>

<script>
import { remote } from "electron";

export default {
  beforeCreate() {
    document
      .getElementsByTagName("body")[0]
      .setAttribute("style", "background-color:rgba(0,0,0,0);");
  },
  mounted() {
    const self = this;
    document.addEventListener("keyup", function (e) {
      console.log(e.keyCode);
      if (e.keyCode === 27) {
        const window = remote.getCurrentWindow();
        window.close();
      }
    });
  },
  computed: {
    background() {
      return this.$store.state.Config["container_style"]["background"];
    },
  },
};
</script>

<style scoped>
.container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow-y: auto;
  /* background-color: rgba(0, 0, 0, 0.3); */
  -webkit-app-region: drag;
}
</style>
