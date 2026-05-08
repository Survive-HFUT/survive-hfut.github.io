<script setup lang="ts">
import { data as updates } from '../recent-updates.data'

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="recent-updates" v-if="updates && updates.length > 0">
    <div class="container">
      <div class="header">
        <h2 class="title">
          <span class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M12 7v5l4 2"/></svg>
          </span>
          最近更新
        </h2>
        <div class="divider"></div>
      </div>
      <div class="update-grid">
        <div v-for="update in updates" :key="update.hash + update.path" class="update-card">
          <a :href="update.path" class="update-link">
            <div class="update-content">
              <div class="file-info">
                <div class="file-title">{{ update.title }}</div>
                <div class="file-path">{{ update.path }}</div>
              </div>
              <div class="meta-info">
                <div class="author-tag">
                  <img :src="`https://github.com/${update.author}.png`" class="avatar" @error="(e) => (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + update.author" />
                  <span class="author-name">{{ update.author }}</span>
                </div>
                <span class="date">{{ formatDate(update.date) }}</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recent-updates {
  margin: 24px 0;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  margin: 0;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: white;
}

.icon-wrapper svg {
  width: 18px;
  height: 18px;
}

.divider {
  flex: 1;
  height: 1px;
  background: var(--vp-c-divider);
}

.update-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

@media (max-width: 640px) {
  .update-grid {
    grid-template-columns: 1fr;
  }
}

.update-card {
  position: relative;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.update-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-4px);
  background-color: var(--vp-c-bg-mute);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
}

.update-link {
  display: block;
  padding: 16px;
  text-decoration: none !important;
}

.update-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

.file-path {
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  opacity: 0.8;
  word-break: break-all;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--vp-c-divider);
}

.author-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--vp-c-bg-mute);
  padding: 2px 8px 2px 2px;
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.date {
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-weight: 500;
}
</style>
