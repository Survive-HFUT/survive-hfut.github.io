<script setup lang="ts">
import { data as updates } from '../../recent-updates.data'

const latest = updates && updates.length > 0 ? updates[0] : null

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="latest-update-container" v-if="latest">
    <div class="latest-update-card">
      <div class="update-tag">NEW</div>
      <div class="update-content">
        <span class="update-message">
          最近更新：<a :href="latest.path" class="file-link">{{ latest.title }}</a>
        </span>
        <span class="update-meta">
          by {{ latest.author }} · {{ formatDate(latest.date) }}
        </span>
      </div>
      <a href="/about/updates" class="more-link">
        查看更多
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </a>
    </div>
  </div>
</template>

<style scoped>
.latest-update-container {
  display: flex;
  justify-content: center;
  margin: 24px 0 -12px;
  padding: 0 24px;
}

.latest-update-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 24px;
  font-size: 13px;
  transition: all 0.3s ease;
  max-width: 100%;
}

.latest-update-card:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-mute);
  transform: translateY(-2px);
}

.update-tag {
  background: var(--vp-c-brand-1);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.update-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
}

.file-link {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.file-link:hover {
  text-decoration: underline;
}

.update-meta {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.more-link {
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--vp-c-text-3);
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  padding-left: 12px;
  border-left: 1px solid var(--vp-c-divider);
}

.more-link:hover {
  color: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .update-meta {
    display: none;
  }
  .latest-update-card {
    padding: 6px 12px;
  }
}
</style>
