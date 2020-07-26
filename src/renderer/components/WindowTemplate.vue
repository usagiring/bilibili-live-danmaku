<template>
  <div class="danmaku-example-wrapper">
    <slot></slot>
  </div>
</template>

<script>
export default {
  beforeCreate() {
    document
      .getElementsByTagName("body")[0]
      .setAttribute("style", "background-color:rgba(0,0,0,0);");
  },
};
</script>

<style scoped>

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
</style>
