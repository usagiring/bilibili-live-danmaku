<template>
  <span
    :style="{
      'background-image': `linear-gradient(to right, ${medalColorStart}, ${medalColorEnd})`,
      color: 'white',
      'font-size': '12px',
      border: `solid 0.5px ${medalColorBorder}`,
      padding: '0px 2px',
      'margin-right': '2px'
      }"
  >{{ `${medalName}${medalLevel}` }}</span>
</template>

<script>
export default {
  name: 'FanMedal',
  props: ['medalColorStart', 'medalColorEnd', 'medalColorBorder', 'medalName', 'medalLevel'],
}
</script>

<style scoped>
</style>
