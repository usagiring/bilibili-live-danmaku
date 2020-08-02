<template>
  <div>
    <span>{{name}}</span>
    <template v-if="type === 'InputNumber'">
      <InputNumber :value="value" @on-change="updateStyle" :min="0" size="small" />
    </template>
    <template v-if="type === 'ColorPicker'">
      <ColorPicker :value="value" @on-active-change="updateStyle" size="small" alpha />
    </template>
  </div>
</template>

<script>
export default {
  props: ["type", "name", "role", "prop", "styleName"],
  data() {
    return {};
  },
  computed: {
    value() {
      const value = this.$store.state.Config[`${this.role}_${this.prop}`][
        `${this.styleName}`
      ];

      if (this.type === "InputNumber") {
        if (!value) return 0;
        return this.pxParser(value);
      }
      if (this.type === "ColorPicker") {
        if (!value) return "";
        return value;
      }
      return "";
    },
  },
  methods: {
    updateStyle(value) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: this.role,
        prop: this.prop,
        style: {
          [this.styleName]:
            this.type === "InputNumber" ? this.pxFormatter(value) : value,
        },
      });
    },
    pxFormatter: (value) => `${value}px`,
    pxParser: (value) => Number(value.replace("px", "")),
  },
};
</script>

<style scoped>
</style>

