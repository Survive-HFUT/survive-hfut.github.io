<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ReadingProgressController } from '../composables/useReadingProgress.ts';

const props = defineProps<{ reading: ReadingProgressController }>();
const {
  ready,
  trackable,
  article,
  status,
  progressPercent,
  snapshotSaved,
  markAsRead,
  markAsUnread,
} = props.reading;
const busy = ref(false);
const readAtText = computed(() =>
  article.value.readAt
    ? new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(
        article.value.readAt,
      )
    : '',
);

async function run(action: () => Promise<void>) {
  if (busy.value) return;
  busy.value = true;
  try {
    await action();
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <section
    v-if="ready && trackable"
    class="reading-status-panel"
    data-reading-ignore
  >
    <div class="reading-status-copy">
      <span class="reading-status-label">阅读状态</span>
      <template v-if="status === 'read'">
        <strong>✓ 已读当前版本</strong>
        <p v-if="readAtText">上次确认已读：{{ readAtText }}</p>
      </template>
      <template v-else-if="status === 'updated'">
        <strong>本文有尚未确认的更新</strong>
        <p>你上次确认已读的版本仍作为更新比较基准。</p>
      </template>
      <template v-else-if="status === 'reading'">
        <strong>○ 阅读中 · 约 {{ progressPercent }}%</strong>
        <p>滚动进度不会自动把文章标记为已读。</p>
      </template>
      <template v-else>
        <strong>○ 尚未标记为已读</strong>
      </template>
    </div>

    <div class="reading-actions">
      <button
        v-if="status === 'unread' || status === 'reading'"
        type="button"
        class="reading-button is-primary"
        :disabled="busy"
        @click="run(markAsRead)"
      >
        ✓ 标记为已读
      </button>
      <button
        v-else-if="status === 'updated'"
        type="button"
        class="reading-button is-primary"
        :disabled="busy"
        @click="run(markAsRead)"
      >
        ✓ 已读完这些更新
      </button>
      <button
        v-if="status === 'read' || status === 'updated'"
        type="button"
        class="reading-button"
        :disabled="busy"
        @click="run(markAsUnread)"
      >
        标记为未读
      </button>
    </div>

    <p
      v-if="snapshotSaved === false"
      class="reading-storage-warning"
      role="status"
    >
      已保存基础阅读状态，但当前浏览器无法保存正文快照；后续只能提示文章有更新，不能定位具体变化。
    </p>
    <p class="reading-privacy">阅读记录仅保存在当前浏览器中，不会上传。</p>
  </section>
</template>
