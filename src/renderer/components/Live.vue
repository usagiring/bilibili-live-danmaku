<template>
  <div>
    <Button @click="record">record</Button>
    <Button @click="getPlayUrl">getPlayUrl</Button>
    <!-- <script src="flv.min.js"></script> -->
    <video id="videoElement"></video>
  </div>
</template>

<script>
import * as flvjs from "flv.js";
import recorder from "../../service/bilibili-recorder";
export default {
  data() {
    return {};
  },
  computed: {
    realRoomId() {
      return this.$store.state.Config.realRoomId;
    },
  },
  mounted() {},
  methods: {
    async record() {
      recorder.record(this.realRoomId);
    },
    async getPlayUrl() {
      const result = await recorder.getPlayUrl(this.realRoomId);
      const playUrl = result.data.durl[0].url;
      console.log(playUrl);

      if (flvjs.isSupported()) {
        var videoElement = document.getElementById("videoElement");
        var flvPlayer = flvjs.createPlayer({
          type: "flv",
          url: playUrl,
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();
      }
    },
  },
};
</script>

<style scoped>
</style>
