<script setup lang="ts">
// @ts-expect-error
import { data } from '../../data/recentChanges.data';

// @ts-expect-error
import { data as all } from '../../data/sidebar.data';

const d = (data as { path: string; updatedAt: Date }[])
  .filter((item) => all.includes(item.path) && item.path.startsWith('docs/'))
  .map((item) => ({
    path: item.path.replace('docs/', '').replace(/\.md$/, ''),
    updatedAt: item.updatedAt,
  }));
</script>

<template>
  <div v-for="value in d" :key="value.path">
    <p>{{ value.path }}</p>
    <p>{{ value.updatedAt }}</p>
  </div>
</template>
