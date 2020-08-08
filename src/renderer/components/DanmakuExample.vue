<template>
  <div>
    <div class="super-chat-content-wrapper">
      <span class="super-chat-in-top" style="background: Gold">
        <Avatar
          class="super-chat-avatar"
          src="https://i.loli.net/2017/08/21/599a521472424.jpg"
          size="small"
        />
        <span class="super-chat-text">$100</span>
      </span>
    </div>
    <div class="message-content-wrapper">
      <div class="message-content">
        <p
          :class="`message message-${message.role}`"
          :style="getMessageStyleByRole(message)"
          :key="message.id"
          v-for="message in messages"
        >
          <span
            :class="`name-${message.role}`"
            :style="getNameStyleByRole(message)"
          >{{message.name}}:</span>
          <span
            :class="`comment-${message.role}`"
            :style="getCommentStyleByRole(message)"
          >{{message.comment}}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import WindowTemplate from "./WindowTemplate.vue";

export default {
  components: {
    WindowTemplate,
  },
  data() {
    return {
      superChats: [
        {
          uid: "12346",
          name: "sc",
          type: "super-chat",
          number: 100,
          unit: "RMB",
          comment: "!!!!!!!!!!!!!!!",
          role: "normal",
        },
      ],
    };
  },
  computed: {
    messages() {
      return this.$store.state.Message.exampleMessages;
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

    captain_message() {
      return this.$store.state.Config.captain_message;
    },
    captain_name() {
      return this.$store.state.Config.captain_name;
    },
    captain_comment() {
      return this.$store.state.Config.captain_comment;
    },
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
    },
  },
};
</script>

<style scoped>
.layout {
  position: relative;
  overflow: hidden;
}
.layout-logo {
  float: left;
  position: relative;
}
.layout-nav {
  margin: 0 auto;
}
.layout-footer-center {
  text-align: center;
}

.danmaku-example-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.3);
  -webkit-app-region: drag;
}
.super-chat-content-wrapper {
  height: 40px;
  line-height: 32px;
}
.message-content-wrapper {
  height: 310px;
  overflow: hidden;
  position: relative;
}
.message-content {
  position: absolute;
  bottom: 0px;
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
}
.super-chat-text {
}

.message-normal {
}
</style>
