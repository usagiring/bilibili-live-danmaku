<template>
  <div>
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
        <span :class="`name-${message.role}`" :style="getNameStyleByRole(message)">{{message.name}}:</span>
        <span
          :class="`comment-${message.role}`"
          :style="getCommentStyleByRole(message)"
        >{{message.comment}}</span>
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
        "background-color:rgba(0,0,0,0.3);-webkit-app-region: drag;"
      );
  },

  data() {
    return {
      messageStyleJianzhang: {},
      messageStyleTidu: {},
      messageStyleZongdu: {},

      // nameStyleNormal: {
      //   color: "white"
      // },
      nameStyleJianzhang: {
        color: "green"
      },
      nameStyleTidu: {
        color: "white"
      },
      nameStyleZongdu: {
        color: "white"
      },

      commentStyleNormal: {
        color: "white"
      },
      commentStyleJianzhang: {
        color: "white"
      },
      commentStyleTidu: {
        color: "white"
      },
      commentStyleZongdu: {
        color: "white"
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
      return this.$store.state.Comment.exampleComments;
    },

    messageStyle() {
      return this.$store.state.Config.message;
    },
    normal_message() {
      return this.$store.state.Config.normal_message;
    },
    normal_name() {
      return this.$store.state.Config.normal_name;
    },
    normal_comment() {
      return this.$store.state.Config.normal_comment;
    },
    tidu_name() {
      return this.$store.state.Config.normal_name;
    },
    zongdu_name() {
      return this.$store.state.Config.normal_name;
    }
  },
  methods: {
    showMemberShipIcon(status) {
      this.isShowMemberShipIcon = status;
    },
    getMessageStyleByRole(message) {
      return this[`${message.role}_message`];
    },
    getNameStyleByRole(message) {
      return this[`${message.role}_name`];
    },
    getCommentStyleByRole(message) {
      return this[`${message.role}_comment`];
    }
  }
};
</script>

<style scoped>
.danmaku-example {
  background-color: rgba(0, 0, 0, 0.3);
}
.super-chat-avatar {
  transform: translate(0%, -5%);
}
.super-chat-in-top {
  display: inline-block;
  height: 32px;
  border-radius: 20px;
  padding: 0px 10px;
  font-size: 18px;
  line-height: 32px;
}
.super-chat-text {
}

.message-normal {
}
</style>
