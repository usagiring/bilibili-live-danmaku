<template>
  <div id="app">
    <link
      href="../node_modules/animate.css/animate.compat.css"
      rel="stylesheet"
      type="text/css"
    />
    <router-view></router-view>
  </div>
</template>

<script>
import { remote, ipcRenderer } from "electron";

export default {
  name: "bilibili-danmaku",
  created() {
    ipcRenderer.on("ping", (event, message) => {
      console.log(message)

      this.$Message.info('This is a info tip');
    });
  },
};
</script>

<style>
/* CSS */
</style>
