<template>
  <div class="danmaku-example">
    <div>
      <span class="super-chat-in-top" style="background: Gold">
        <Avatar
          class="super-chat-avatar"
          src="https://i.loli.net/2017/08/21/599a521472424.jpg"
          size="small"
        />
        <span class="super-chat-text">$100</span>
      </span>
    </div>
    <!-- <Divider size="small" /> -->
    <div>
      <p
        :class="`message message-${message.role}`"
        :style="getMessageStyleByRole(message)"
        :key="message.id"
        v-for="message in messages"
      >
        <span :class="`name-${message.role}`" :style="getNameStyleByRole(message)">{{message.name}}</span>:
        <span :class="`comment-${message.role}`">{{message.comment}}</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  beforeCreate() {
    document
      .getElementsByTagName("body")[0]
      .setAttribute(
        "style",
        "background-color:rgba(0,0,0,0);-webkit-app-region: drag;"
      );
  },

  data() {
    return {
      messageStyleNormal: {},
      messageStyleJianzhang: {},
      nameStyleNormal: {
        color: "black"
      },
      commentStyleNormal: {
        color: "black"
      },
      nameStyleJianzhang: {
        color: "green"
      },

      superChats: [
        {
          uid: "12346",
          name: "马自立",
          type: "super-chat",
          number: 100,
          unit: "RMB",
          comment: "我就是Hololive！！！",
          role: "normal"
        }
      ]
    };
  },
  computed: {
    messages() {
      return this.$store.state.Comment.exampleComments
    }
  },
  methods: {
    showMemberShipIcon(status) {
      this.isShowMemberShipIcon = status;
    },
    getMessageStyleByRole(message) {
      if (message.role === "normal") {
        return this.messageStyleNormal;
      }
    },
    getNameStyleByRole(message) {
      if (message.role === "normal") {
        return this.nameStyleNormal;
      } else if (message.role === "jianzhang") {
        return this.nameStyleJianzhang;
      }
    }
  }
};
</script>

<style scoped>
.danmaku-example {
  /* position: absolute; */
  /* width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0); */
}
</style>
