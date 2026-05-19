<script setup lang="ts">
import { Author } from '@nolebase/vitepress-plugin-git-changelog';
import { data as contributors } from '../../data/contributors.data';
import { data as recentChanges } from '../../data/recentChanges.data';
import { data as links } from '../../data/links.data';
import LinkCard from './LinkCard.vue';

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

for (const item of recentChanges as {
  path: string;
  updatedAt: string;
  authorName: string;
  sectionTitle: string;
  sectionSlug: string;
  excerpt: string;
}[]) {
  const match = (links as [string, string][]).find(
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
  <div class="update-list">
    <LinkCard
      v-for="value in d"
      :key="`${value.path}-${value.updatedAt}`"
      :href="value.href"
      :title="value.title"
      :subtitle="value.sectionTitle"
    >
      <template #right>
        <span style="font-size: 13px;">
          {{ formatRelativeTime(value.updatedAt) }}
        </span>
      </template>
      <p v-if="value.excerpt" class="excerpt">{{ value.excerpt }}</p>
      <template #footer>
        <div class="author">
          <span>{{ value.authorName }}</span>
        </div>
      </template>
    </LinkCard>
  </div>
</template>

<style scoped>
.update-list {
  display: grid;
  gap: 16px;
}

.excerpt {
  margin: 0;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
</style>
