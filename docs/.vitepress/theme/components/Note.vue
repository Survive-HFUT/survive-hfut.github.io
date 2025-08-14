<script lang="ts" setup>
import { ref } from 'vue';

const state = ref(false);
</script>

<template>
  <sup @click="state = !state">
    <a>[注]</a> <span v-show="state"><slot></slot></span>
  </sup>
</template>

<style scoped>
sup {
  cursor: pointer;
}

span {
  margin-right: 10px;
}
</style>
