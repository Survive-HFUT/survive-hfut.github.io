<script setup lang="ts">
import { computed } from 'vue';
import type { ReadingProgressController } from '../composables/useReadingProgress.ts';

const props = defineProps<{ reading: ReadingProgressController }>();
const {
  ready,
  trackable,
  article,
  status,
  progressPercent,
  resumeAvailable,
  restoreNotice,
  restoreProgress,
  markAsRead,
} = props.reading;
const readAtText = computed(() =>
  article.value.readAt
    ? new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(
        article.value.readAt,
      )
    : '',
);
</script>

<template>
  <div v-if="ready && trackable" class="reading-doc-before" data-reading-ignore>
    <section v-if="resumeAvailable" class="reading-resume-card">
      <div>
        <strong>继续上次阅读</strong>
        <p>
          <template v-if="article.lastHeading"
            >上次看到「{{ article.lastHeading }}」附近 ·
          </template>
          已阅读约 {{ progressPercent }}%
        </p>
      </div>
      <button
        type="button"
        class="reading-button is-primary"
        @click="restoreProgress"
      >
        继续阅读
      </button>
    </section>
    <p v-if="restoreNotice" class="reading-restore-notice" role="status">
      {{ restoreNotice }}
    </p>
    <section v-if="status === 'updated'" class="article-update-banner">
      <div class="article-update-heading">
        <div>
          <span class="article-update-kicker">有更新</span>
          <h2>本文在你上次确认已读后已有更新</h2>
          <p v-if="readAtText">上次确认已读：{{ readAtText }}</p>
          <p>第一阶段仅提示更新状态；后续版本将基于已保存快照展示具体变化。</p>
        </div>
      </div>
      <div class="reading-actions">
        <button
          type="button"
          class="reading-button is-primary"
          @click="markAsRead"
        >
          ✓ 已读完这些更新
        </button>
      </div>
    </section>
  </div>
</template>
