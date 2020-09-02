<template>
  <div :style="{border: `solid 1px ${priceProperties.backgroundBottomColor}`}" class="message-super-chat">
    <div :style="{background: `${priceProperties.backgroundColor}`, padding: '10px'}">
      <div :style="{display: 'inline-block', 'vertical-align':'top'}">
        <Avatar :src="avatar" size="large" />
      </div>
      <div :style="{display: 'inline-block'}">
        <p>{{name}}</p>
        <p>{{`￥${totalPrice}`}}</p>
      </div>
    </div>
    <div
      :style="{background: `${priceProperties.backgroundBottomColor}`, color: 'white', padding: '10px'}"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ["priceProperties", "avatar", "name", "totalPrice"]
};
</script>

<style scoped>
.message-super-chat {
  border-radius: 10px;
  border: solid 1px rgba(66, 125, 158, 1);
  margin: 5px;
  overflow: hidden;
}
</style>
