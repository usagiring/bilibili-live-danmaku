<template>
  <div :class="`comment-similar-badge animated ${animateKey}`">{{number}}</div>
</template>

<script>
export default {
  props: ["number"],
  data() {
    return {
      animateKey: "",
    };
  },
  watch: {
    number: function (newValue) {
      this.animateKey = "rubberBand";
      setTimeout(() => {
        this.animateKey = "";
      }, 500);
    },
  },
};
</script>

<style scoped>
.comment-similar-badge {
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  line-height: 16px;
  font-size: 12px;
  font-family: monospace;
  background: burlywood;
  color: white;
  padding-right: 1px;
}
</style>
