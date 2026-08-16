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
  changeSummary,
  changes,
  changedSections,
  diffLoading,
  diffUnavailable,
  updateOnly,
  restoreNotice,
  restoreProgress,
  showAllUpdates,
  toggleUpdateOnly,
  markAsRead,
  jumpToSection,
} = props.reading;

const totalChanges = computed(
  () =>
    changeSummary.value.added +
    changeSummary.value.modified +
    changeSummary.value.deleted,
);
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
          <template v-if="article.lastHeading">
            上次看到「{{ article.lastHeading }}」附近 ·
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
          <h2>
            自你上次阅读后
            <template v-if="!diffLoading && !diffUnavailable">
              有 {{ totalChanges }} 处更新
            </template>
            <template v-else>本文已有更新</template>
          </h2>
          <p v-if="readAtText">上次确认已读：{{ readAtText }}</p>
        </div>
      </div>

      <p v-if="diffLoading" class="article-update-loading" role="status">
        正在比较你上次读过的版本……
      </p>
      <div v-else-if="diffUnavailable" class="article-update-fallback">
        <p v-if="diffUnavailable === 'storage'">
          当前浏览器无法读取旧版阅读快照，因此暂时不能定位具体更新。
        </p>
        <p v-else>
          没有找到你上次已读版本的正文快照，因此暂时不能定位具体更新。
        </p>
        <p>基础已读状态和阅读进度不会受影响。</p>
      </div>
      <template v-else>
        <p class="article-update-summary">
          <span v-if="changeSummary.added"
            >新增 {{ changeSummary.added }} 处</span
          >
          <span v-if="changeSummary.modified"
            >修改 {{ changeSummary.modified }} 处</span
          >
          <span v-if="changeSummary.deleted"
            >删除 {{ changeSummary.deleted }} 处</span
          >
          <span v-if="changes.length === 0">正文结构未检测到可见差异</span>
        </p>

        <div v-if="changedSections.length" class="article-update-sections">
          <span>本次更新涉及：</span>
          <button
            v-for="section in changedSections"
            :key="`${section.title}-${section.anchor ?? ''}`"
            type="button"
            @click="jumpToSection(section.anchor)"
          >
            {{ section.title }}
          </button>
        </div>
      </template>

      <div class="reading-actions">
        <button
          v-if="changes.length"
          type="button"
          class="reading-button"
          @click="showAllUpdates"
        >
          查看全部更新
        </button>
        <button
          v-if="changes.length"
          type="button"
          class="reading-button"
          :aria-pressed="updateOnly"
          @click="toggleUpdateOnly"
        >
          {{ updateOnly ? '返回完整文章' : '仅显示更新' }}
        </button>
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
