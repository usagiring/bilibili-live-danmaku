<template>
  <div>
    <div class="searcher-wrapper">
      <div :style="{ display: 'inline-block' }">
        <template v-if="!onRecord">
          <Button
            @click="startRecord"
            shape="circle"
            :style="{ width: '100px' }"
          >
            <Icon type="md-radio-button-on" color="red" />
            录制
          </Button>
        </template>
        <template v-else>
          <Button @click="cancelRecord" shape="circle">
            <Icon type="md-square" color="red" />
            停止
          </Button>
        </template>
        00:00:00
        <div :style="{ display: 'inline-block', width: '70px' }">1024 kb/s</div>
        <Select
          :value="recordQuality"
          style="width: 70px"
          @on-change="changeRecordQuality"
        >
          <Option
            v-for="quality in qualities"
            :value="quality.value"
            :key="quality.key"
            >{{ quality.value }}</Option
          >
        </Select>
        <Button @click="openRecordSaveFolderSelector" shape="circle">
          选择文件夹
        </Button>
        {{ recordDir }}
      </div>
      <div>
        <Button @click="play" shape="circle">
          <Icon type="md-play" />
          播放
        </Button>
        <Select
          :value="playQuality"
          style="width: 70px"
          @on-change="changePlayQuality"
        >
          <Option
            v-for="quality in qualities"
            :value="quality.value"
            :key="quality.key"
            >{{ quality.value }}</Option
          >
        </Select>
      </div>
    </div>

    <!-- <script src="flv.min.js"></script> -->
    <video id="livePlayer"></video>
  </div>
</template>

<script>
import * as flvjs from "flv.js";
import { remote } from "electron";
const dialog = remote.dialog;
import recorder from "../../service/bilibili-recorder";
import { DEFAULT_RECORD_DIR } from "../../service/const";
export default {
  data() {
    return {
      onRecord: false,
      recordQuality: "原画",
      playQuality: "超清",
      qualities: [
        {
          key: 1,
          value: "原画",
        },
        {
          key: 2,
          value: "蓝光",
        },
        {
          key: 3,
          value: "超清",
        },
        {
          key: 4,
          value: "高清",
        },
        {
          key: 5,
          value: "流畅",
        },
      ],
    };
  },
  computed: {
    realRoomId() {
      return this.$store.state.Config.realRoomId;
    },
    recordDir() {
      return this.$store.state.Config.recordDir || DEFAULT_RECORD_DIR;
    },
  },
  mounted() {},
  methods: {
    async startRecord() {
      recorder.record(this.realRoomId, this.recordDir, this.recordQuality);
      this.onRecord = true;
    },
    async cancelRecord() {
      recorder.cancelRecord();
      this.onRecord = false;
    },
    async play() {
      const result = await recorder.getPlayUrl(this.realRoomId);
      const playUrl = result.data.durl[0].url;
      console.log(playUrl);

      if (flvjs.isSupported()) {
        var livePlayer = document.getElementById("livePlayer");
        var flvPlayer = flvjs.createPlayer({
          type: "flv",
          url: playUrl,
        });
        flvPlayer.attachMediaElement(livePlayer);
        flvPlayer.load();
        flvPlayer.play();
      } else {
        console.error("flvjs not support");
      }
    },

    changeRecordQuality(value) {
      this.recordQuality = value;
    },

    changePlayQuality(value) {
      this.playQuality = value;
    },

    async openRecordSaveFolderSelector() {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
      console.log(result);
      if (!result.canceled) {
        const recordDir = result.filePaths[0];
        this.$store.dispatch("UPDATE_CONFIG", {
          recordDir,
        });
        await this.$nextTick();
      }
    },
  },
};
</script>

<style scoped>
</style>
