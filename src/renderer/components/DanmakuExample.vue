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
  data() {
    return {
      messageStyleNormal: {
        background: "#FFFFFF"
      },
      messageStyleJianzhang: {
        background: "#FFFFFF"
      },
      nameStyleNormal: {
        color: "black"
      },
      commentStyleNormal: {
        color: "#FFFFFF"
      },
      nameStyleJianzhang: {
        color: "green"
      },

      messages: [
        {
          id: 1,
          uid: "12345",
          name: "其妙",
          comment: "草",
          role: "jianzhang"
        },
        {
          id: 2,
          uid: "12346",
          name: "马自立",
          type: "comment",
          comment: "我就是Hololive！！！",
          role: "tidu"
        },
        {
          id: 3,
          uid: "12346",
          name: "马自立",
          type: "gift",
          comment: "我就是Hololive！！！",
          role: "normal"
        },
        {
          id: 4,
          uid: "12346",
          name: "马自立",
          type: "super-chat",
          comment: "我就是Hololive！！！",
          role: "normal"
        },
        {
          id: 5,
          uid: "12345",
          name: "Res",
          comment: "草",
          role: "normal"
        }
      ],
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
#app html body {
  background: yellow
}
</style>
