<script lang="ts" setup>
import { computed } from 'vue';

const prop = defineProps({
  list: {
    type: Array,
  },
});

const typed = computed(() => {
  return prop.list as string[];
});
</script>

<template>
  <div class="custom-block tip">
    <p class="custom-block-title">💡 提示</p>
    <p>
      此页面需要更多补充。
      <a href="/about/contribute">
        <strong>帮助我们</strong>
      </a>
    </p>
    <ul v-if="typed">
      <li v-for="line in typed" :key="line">
        {{ line }}
      </li>
    </ul>
  </div>
</template>
