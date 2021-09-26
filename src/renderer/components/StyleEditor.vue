<template>
  <div :style="{display: 'inline-block'}">
    <span>{{ name }}</span>
    <template v-if="type === 'InputNumber'">
      <InputNumber :value="value" @on-change="updateStyle" :min="0" :step="numberStep || 1" size="small" :style="{ width: '55px' }" />
    </template>
    <template v-if="type === 'ColorPicker'">
      <ColorPicker :value="value" @on-active-change="updateStyle" size="small" alpha />
    </template>
  </div>
</template>

<script>
import { mergeSetting } from '../../service/api'

export default {
  props: ["type", "name", "role", "prop", "styleName", "numberStep"],
  data() {
    return {};
  },
  computed: {
    value() {
      const objKey = `${this.prop}_lv${this.role}`
      const value = this.$store.state.Config[objKey][
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
    async updateStyle(value) {
      value = value || 0;
      this.$store.dispatch("UPDATE_STYLE", {
        role: this.role,
        prop: this.prop,
        style: {
          [this.styleName]:
            this.type === "InputNumber" ? this.pxFormatter(value) : value,
        },
      })

      const objKey = `${this.prop}_lv${this.role}`
      const data = {
        [objKey]: { [this.styleName]: this.type === "InputNumber" ? this.pxFormatter(value) : value }
      }
      await mergeSetting(data)
    },
    pxFormatter: (value) => `${value}px`,
    pxParser: (value) => Number(value.replace("px", "")),
  },
};
</script>

<style scoped>
.setting-key-text {
  width: 90px;
  display: inline-block;
}
</style>

