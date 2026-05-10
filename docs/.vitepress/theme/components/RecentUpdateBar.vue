<script setup lang="ts">
// @ts-expect-error
import { data } from '../../data/recentChanges.data';

// @ts-expect-error
import { data as all } from '../../data/sidebar.data';

// @ts-expect-error
import { data as contributors } from '../../data/contributors.data';
import { Author } from '@nolebase/vitepress-plugin-git-changelog';

type RecentChange = {
  path: string;
  updatedAt: string;
  title: string;
  href: string;
  authorName: string;
  sectionTitle: string;
  excerpt: string;
};

function resolveRoutePath(path: string): string {
  return path.replace(/(?:^|\/)index$/, (match) =>
    match.startsWith('/') ? '/' : '',
  );
}

const d: RecentChange[] = [];

for (const item of data as {
  path: string;
  updatedAt: string;
  authorName: string;
  sectionTitle: string;
  sectionSlug: string;
  excerpt: string;
}[]) {
  const match = (all as [string, string][]).find(
    (x) =>
      item.path.replace('.md', '').replace('docs/', '') === x[0] &&
      !item.path.includes('random'),
  );

  if (match) {
    const basePath = resolveRoutePath(match[0]);

    d.push({
      path: basePath,
      updatedAt: item.updatedAt,
      title: match[1],
      href: item.sectionSlug ? `${basePath}#${item.sectionSlug}` : basePath,
      authorName: getContributorName(item.authorName),
      sectionTitle: item.sectionTitle,
      excerpt: item.excerpt,
    });
  }
}

function getContributorName(name: string): string {
  return (
    (contributors as Author[]).find((a) => a.mapByNameAliases?.includes(name))
      ?.name || name
  );
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
    return `约 ${diffHours + 1} 小时前`;
  }

  return `约 ${diffMinutes + 1} 分钟前`;
}
</script>

<template>
  <a
    v-for="value in d"
    :key="`${value.path}-${value.updatedAt}`"
    :href="value.href"
    class="update-card"
  >
    <div class="card-header">
      <div class="title-group">
        <span class="title">{{ value.title }}</span>
        <span v-if="value.sectionTitle" class="section">{{
          value.sectionTitle
        }}</span>
      </div>
      <span class="time">{{ formatRelativeTime(value.updatedAt) }}</span>
    </div>
    <p v-if="value.excerpt" class="excerpt">{{ value.excerpt }}</p>
    <div class="meta">
      <div class="author">
        <span>{{ value.authorName }}</span>
      </div>
    </div>
  </a>
</template>

<style scoped>
.update-card {
  display: block;
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-weight: 400;
  padding: 16px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 82%, transparent);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
  margin-bottom: 20px;
}

.update-card:hover {
  border-color: var(--vp-c-brand-1);
  background: color-mix(
    in srgb,
    var(--vp-c-bg-soft) 96%,
    var(--vp-c-brand-soft)
  );
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-weight: 600;
}

.section {
  font-size: 14px;
  color: var(--vp-c-brand-1);
}

.excerpt {
  margin: 10px 0 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.time {
  color: var(--vp-c-text-2);
  font-size: 14px;
  white-space: nowrap;
}

.jump {
  color: var(--vp-c-brand-1);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .card-header,
  .meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .time,
  .jump {
    white-space: normal;
  }
}
</style>
