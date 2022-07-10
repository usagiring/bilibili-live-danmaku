<template>
  <div>
    <div>
      asr自动语音识别技术
    </div>

    <div>
      阿里云
      <span>AccessKeyId</span>
      <span>AccessKeySecret</span>
      <span>AppKey</span>
      <span>服务器</span>
    </div>
  </div>
</template>

<script>
// TODO 
// 设置ffmpeg 路径
// 实例保存

// 结果
// 1 输出文件
// 2 实时显示(独立窗口)
// 3 聊天机器人
import ASR from '@tokine/asr'
import { getRandomPlayUrl } from "../../service/bilibili-recorder"

export default {
  data() {
    return {
      playQuality: "高清",
      configChanged: false,
    };
  },

  computed: {
    realRoomId() {
      return this.$store.state.Config.realRoomId;
    },
    isWithCookie() {
      return this.$store.state.Config.isWithCookie;
    },
    userCookie() {
      return this.$store.state.Config.userCookie;
    },
  },

  created() {

  },

  methods: {
    async start() {
      let asr = this.asr
      // 如果没有初始化asr 或者 配置变化，重新初始化asr实例
      if (!asr || this.configChanged) {
        const __asr = new ASR()
        await __asr.init({
          accessKeyId,
          accessKeySecret,
          serviceUrl: 'wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1',
          appKey: '',
        })

        asr = __asr
        this.asr = __asr // TODO
      }


      const playUrl = await getRandomPlayUrl({
        roomId: this.realRoomId,
        quality: this.playQuality,
        cookie: this.isWithCookie ? this.userCookie : undefined,
      });
      console.log(playUrl);

      asr.start({
        url: playUrl
      })
      asr.on('begin', (msg) => {
        console.log(msg)
      })
      asr.on('end', (msg) => {
        console.log(msg)
      })
      asr.on('change', (msg) => {
        console.log(msg)
      })
    },

    stop() {

    }
  }
};
</script>

<style scoped>
</style>
