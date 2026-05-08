<script setup lang="ts">
// @ts-expect-error
import { data } from '../../data/recentChanges.data';

// @ts-expect-error
import { data as all } from '../../data/sidebar.data';

const d: { path: string; updatedAt: string; title: string }[] = [];

for (const item of data as { path: string; updatedAt: string }[]) {
  const match = (all as [string, string][]).find(
    (x) =>
      item.path.replace('.md', '').replace('docs/', '') === x[0] &&
      !item.path.includes('random'),
  );

  if (match) {
    d.push({
      path: match[0].replace('index', ''),
      updatedAt: item.updatedAt,
      title: match[1],
    });
  }
}

function formatRelativeTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays >= 1) {
    return `${diffDays}天前`;
  }

  if (diffHours >= 1) {
    return `${diffHours}小时前`;
  }

  return `${diffMinutes}分钟前`;
}
</script>

<template>
  <a v-for="(value, i) in d" :key="value.path" :href="value.path">
    <div>
      <span class="title">{{ value.title }}</span>
      <span class="time">{{ formatRelativeTime(value.updatedAt) }}</span>
    </div>
    <hr v-if="i != d.length - 1" />
  </a>
</template>

<style scoped>
a {
  color: var(--vp-c-text-1);
  text-decoration: initial;
  font-weight: initial;
}

a div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
}

.title {
  font-weight: 500;
}

.time {
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
