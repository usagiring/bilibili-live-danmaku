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
  created() {},
  mounted() {
    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV === "production") {
      autoUpdater.on("update-available", () => {
        this.$Message.info('发现新版本，立即更新？');
        dialog.showMessageBox(
          {
            type: "info",
            title: "版本更新",
            message: "发现新版本，立即更新？",
            buttons: ["是", "否"],
          },
          (buttonIndex) => {
            if (buttonIndex === 0) {
              autoUpdater.downloadUpdate();
            }
          }
        );
      });

      autoUpdater.checkForUpdates();
    }
  },
};
</script>

<style>
/* CSS */
</style>
