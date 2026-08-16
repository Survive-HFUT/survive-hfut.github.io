<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { inBrowser, withBase } from 'vitepress';
import { data as articleVersions } from '../../data/articleVersions.data.ts';
import {
  buildReadingOverviewArticles,
  countReadingOverview,
  filterReadingOverview,
  recentlyReadArticles,
  type ReadingFilter,
  type ReadingOverviewArticle,
} from '../utils/readingOverview.ts';
import {
  clearReadingState,
  readReadingState,
  READING_STATE_EVENT,
} from '../utils/readingStorage.ts';
import type { ReadingState, ReadingStatus } from '../utils/readingTypes.ts';
import { clearArticleSnapshots } from '../utils/snapshotStorage.ts';

const emptyState = (): ReadingState => ({ version: 1, articles: {} });
const state = ref<ReadingState>(emptyState());
const ready = ref(false);
const filter = ref<ReadingFilter>('all');
const showClearDialog = ref(false);
const clearing = ref(false);
const clearMessage = ref('');

const articles = computed(() =>
  buildReadingOverviewArticles(articleVersions, state.value),
);
const counts = computed(() => countReadingOverview(articles.value));
const recentArticles = computed(() => recentlyReadArticles(articles.value));
const updatedArticles = computed(() =>
  filterReadingOverview(articles.value, 'updated'),
);
const filteredArticles = computed(() =>
  filterReadingOverview(articles.value, filter.value),
);
const lastVisitedArticle = computed(() =>
  articles.value.find((article) => article.path === state.value.lastVisited),
);

const filters: Array<{ key: ReadingFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'reading', label: '阅读中' },
  { key: 'read', label: '已读' },
  { key: 'updated', label: '有更新' },
];

const statusLabels: Record<ReadingStatus, string> = {
  unread: '未读',
  reading: '阅读中',
  read: '已读',
  updated: '有更新',
};

function refreshState(): void {
  state.value = readReadingState();
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(
    timestamp,
  );
}

function formatOpenedAt(timestamp?: number): string {
  if (!timestamp) return '尚未打开';
  const elapsed = Date.now() - timestamp;
  const minutes = Math.max(1, Math.floor(elapsed / 60_000));
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return formatDate(timestamp);
}

function articleDescription(article: ReadingOverviewArticle): string {
  if (article.status === 'reading') {
    return `已阅读约 ${Math.round((article.reading.scrollProgress ?? 0) * 100)}%`;
  }
  if (article.status === 'read') {
    return `确认已读：${formatDate(article.reading.readAt)}`;
  }
  if (article.status === 'updated') {
    return `上次确认已读：${formatDate(article.reading.readAt)}`;
  }
  return '尚无阅读记录';
}

function selectFilter(nextFilter: ReadingFilter): void {
  filter.value = nextFilter;
  document
    .getElementById('reading-all-articles')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function confirmClear(): Promise<void> {
  if (clearing.value) return;
  clearing.value = true;
  clearMessage.value = '';
  const metadataCleared = clearReadingState();
  const snapshotsCleared = await clearArticleSnapshots();
  refreshState();
  clearing.value = false;
  showClearDialog.value = false;

  if (!metadataCleared) {
    clearMessage.value = '当前浏览器未能清除阅读状态。';
  } else if (!snapshotsCleared) {
    clearMessage.value = '阅读状态已清除，但旧版正文快照可能仍保存在浏览器中。';
  } else {
    clearMessage.value = '阅读记录已清除。';
  }
}

onMounted(() => {
  if (!inBrowser) return;
  refreshState();
  ready.value = true;
  window.addEventListener('storage', refreshState);
  window.addEventListener(READING_STATE_EVENT, refreshState);
});

onUnmounted(() => {
  if (!inBrowser) return;
  window.removeEventListener('storage', refreshState);
  window.removeEventListener(READING_STATE_EVENT, refreshState);
});
</script>

<template>
  <div v-if="ready" class="reading-overview">
    <p class="reading-overview-intro">
      阅读状态、进度和更新基准只保存在当前浏览器中。
    </p>

    <div class="reading-overview-stats" aria-label="阅读状态统计">
      <button
        v-for="item in filters"
        :key="item.key"
        type="button"
        :class="{ 'is-active': filter === item.key }"
        :aria-pressed="filter === item.key"
        @click="selectFilter(item.key)"
      >
        <span>{{ item.label }}</span>
        <strong>{{ counts[item.key] }}</strong>
      </button>
    </div>

    <section v-if="lastVisitedArticle" class="reading-overview-continue">
      <div>
        <span class="reading-overview-eyebrow">上次阅读</span>
        <a :href="withBase(lastVisitedArticle.path)">
          {{ lastVisitedArticle.title }}
        </a>
        <p>{{ articleDescription(lastVisitedArticle) }}</p>
      </div>
      <a
        class="reading-overview-primary-link"
        :href="withBase(lastVisitedArticle.path)"
      >
        继续阅读
      </a>
    </section>

    <section class="reading-overview-section">
      <div class="reading-overview-section-heading">
        <h2>最近阅读</h2>
      </div>
      <div v-if="recentArticles.length" class="reading-overview-recent-grid">
        <a
          v-for="article in recentArticles"
          :key="article.path"
          :href="withBase(article.path)"
          class="reading-overview-recent-card"
        >
          <span class="reading-overview-card-title">{{ article.title }}</span>
          <span>
            {{ formatOpenedAt(article.reading.lastOpenedAt) }} ·
            {{ statusLabels[article.status] }}
          </span>
        </a>
      </div>
      <p v-else class="reading-overview-empty">还没有阅读记录。</p>
    </section>

    <section v-if="updatedArticles.length" class="reading-overview-section">
      <div class="reading-overview-section-heading">
        <h2>有更新</h2>
        <span>{{ updatedArticles.length }} 篇</span>
      </div>
      <div class="reading-overview-update-list">
        <a
          v-for="article in updatedArticles"
          :key="article.path"
          :href="withBase(article.path)"
        >
          <span>
            <strong>{{ article.title }}</strong>
            <small>{{ articleDescription(article) }}</small>
          </span>
          <span class="reading-overview-status is-updated">查看更新</span>
        </a>
      </div>
    </section>

    <section id="reading-all-articles" class="reading-overview-section">
      <div class="reading-overview-section-heading">
        <h2>{{ filters.find((item) => item.key === filter)?.label }}篇目</h2>
        <span>{{ filteredArticles.length }} 篇</span>
      </div>
      <div v-if="filteredArticles.length" class="reading-overview-article-list">
        <a
          v-for="article in filteredArticles"
          :key="article.path"
          :href="withBase(article.path)"
        >
          <span class="reading-overview-article-copy">
            <strong>{{ article.title }}</strong>
            <small>{{ articleDescription(article) }}</small>
          </span>
          <span class="reading-overview-status" :class="`is-${article.status}`">
            {{ statusLabels[article.status] }}
          </span>
        </a>
      </div>
      <p v-else class="reading-overview-empty">当前筛选条件下没有篇目。</p>
    </section>

    <section class="reading-overview-settings">
      <div>
        <h2>本地阅读记录</h2>
        <p>清除后，已读状态、阅读位置和旧版正文快照都无法恢复。</p>
      </div>
      <button type="button" @click="showClearDialog = true">
        清除全部记录
      </button>
    </section>

    <p v-if="clearMessage" class="reading-overview-message" role="status">
      {{ clearMessage }}
    </p>

    <div
      v-if="showClearDialog"
      class="reading-overview-dialog-backdrop"
      @click.self="showClearDialog = false"
    >
      <section
        class="reading-overview-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reading-clear-dialog-title"
      >
        <h2 id="reading-clear-dialog-title">清除全部阅读记录？</h2>
        <p>
          将清除所有已读状态、更新基准、阅读位置和正文快照。此操作无法恢复。
        </p>
        <div class="reading-overview-dialog-actions">
          <button
            type="button"
            :disabled="clearing"
            @click="showClearDialog = false"
          >
            取消
          </button>
          <button
            type="button"
            class="is-danger"
            :disabled="clearing"
            @click="confirmClear"
          >
            {{ clearing ? '正在清除…' : '确认清除' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.reading-overview {
  --reading-overview-border: var(--vp-c-divider);
  margin-top: 18px;
}

.reading-overview-intro,
.reading-overview-empty,
.reading-overview-message {
  color: var(--vp-c-text-2);
}

.reading-overview-stats {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin: 20px 0;
}

.reading-overview-stats button {
  display: grid;
  gap: 4px;
  border: 1px solid var(--reading-overview-border);
  border-radius: 10px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  text-align: left;
  cursor: pointer;
}

.reading-overview-stats button:hover,
.reading-overview-stats button.is-active {
  border-color: var(--vp-c-brand-1);
}

.reading-overview-stats button.is-active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.reading-overview-stats strong {
  color: var(--vp-c-text-1);
  font-size: 24px;
}

.reading-overview-continue {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 24px 0;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 12px;
  padding: 16px 18px;
  background: var(--vp-c-brand-soft);
}

.reading-overview-eyebrow {
  display: block;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.reading-overview-continue a:not(.reading-overview-primary-link) {
  display: inline-block;
  margin-top: 2px;
  color: var(--vp-c-text-1);
  font-size: 18px;
  font-weight: 700;
}

.reading-overview-continue p {
  margin: 3px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.reading-overview-primary-link {
  flex: none;
  border-radius: 8px;
  padding: 8px 14px;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
  font-weight: 600;
}

.reading-overview-section {
  margin-top: 34px;
}

.reading-overview-section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.reading-overview-section-heading h2,
.reading-overview-settings h2 {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 19px;
}

.reading-overview-section-heading > span {
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.reading-overview-recent-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.reading-overview-recent-card {
  display: grid;
  gap: 5px;
  border: 1px solid var(--reading-overview-border);
  border-radius: 10px;
  padding: 13px 14px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.reading-overview-recent-card:hover {
  border-color: var(--vp-c-brand-1);
}

.reading-overview-card-title {
  overflow: hidden;
  color: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reading-overview-update-list,
.reading-overview-article-list {
  overflow: hidden;
  border: 1px solid var(--reading-overview-border);
  border-radius: 10px;
}

.reading-overview-update-list > a,
.reading-overview-article-list > a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  color: var(--vp-c-text-1);
}

.reading-overview-update-list > a + a,
.reading-overview-article-list > a + a {
  border-top: 1px solid var(--reading-overview-border);
}

.reading-overview-update-list > a:hover,
.reading-overview-article-list > a:hover {
  background: var(--vp-c-bg-soft);
}

.reading-overview-update-list strong,
.reading-overview-article-copy strong {
  display: block;
  font-size: 14px;
}

.reading-overview-update-list small,
.reading-overview-article-copy small {
  display: block;
  margin-top: 2px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.reading-overview-status {
  flex: none;
  border-radius: 999px;
  padding: 2px 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 600;
}

.reading-overview-status.is-reading {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.reading-overview-status.is-updated {
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-1);
}

.reading-overview-settings {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 40px;
  border-top: 1px solid var(--reading-overview-border);
  padding-top: 22px;
}

.reading-overview-settings p {
  margin: 4px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.reading-overview-settings button,
.reading-overview-dialog button {
  border: 1px solid var(--reading-overview-border);
  border-radius: 8px;
  padding: 7px 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-weight: 600;
  cursor: pointer;
}

.reading-overview-settings button {
  color: var(--vp-c-danger-1);
}

.reading-overview-dialog-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.45);
}

.reading-overview-dialog {
  width: min(100%, 420px);
  border: 1px solid var(--reading-overview-border);
  border-radius: 12px;
  padding: 20px;
  background: var(--vp-c-bg);
  box-shadow: var(--vp-shadow-4);
}

.reading-overview-dialog h2 {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 19px;
}

.reading-overview-dialog p {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.reading-overview-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.reading-overview-dialog button.is-danger {
  border-color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-1);
  color: var(--vp-c-white);
}

.reading-overview-dialog button:disabled {
  opacity: 0.6;
  cursor: wait;
}

@media (max-width: 700px) {
  .reading-overview-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .reading-overview-stats button:first-child {
    grid-column: 1 / -1;
  }

  .reading-overview-continue,
  .reading-overview-settings {
    align-items: stretch;
    flex-direction: column;
  }

  .reading-overview-primary-link,
  .reading-overview-settings button {
    text-align: center;
  }

  .reading-overview-recent-grid {
    grid-template-columns: 1fr;
  }
}
</style>
