<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { data, type OngoingEvent } from '../../data/ongoing.data';
import LinkCard from './LinkCard.vue';

type DisplayEvent = OngoingEvent & {
  rangeText: string;
  progress?: number;
  daysRemaining?: number;
};

const events = data.events;

const ready = ref(false);
const today = ref('');
const nowTimestamp = ref(Date.now());

let tickTimer: ReturnType<typeof setInterval> | undefined;
let dayTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  today.value = getShanghaiDateKey();
  ready.value = true;

  tickTimer = setInterval(() => {
    nowTimestamp.value = Date.now();
  }, 100);
  dayTimer = setInterval(() => {
    const dateKey = getShanghaiDateKey();
    if (dateKey !== today.value) {
      today.value = dateKey;
    }
  }, 60000);
});

onUnmounted(() => {
  if (tickTimer !== undefined) {
    clearInterval(tickTimer);
  }
  if (dayTimer !== undefined) {
    clearInterval(dayTimer);
  }
});

function getShanghaiDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  ) as Record<'year' | 'month' | 'day', string>;

  return `${values.year}-${values.month}-${values.day}`;
}

function formatRange(start: string, end: string): string {
  if (start === end) {
    return start.replace(/^\d{4}-/, '').replace(/-/g, '.');
  }

  return `${start.replace(/^\d{4}-/, '').replace(/-/g, '.')} - ${end
    .replace(/^\d{4}-/, '')
    .replace(/-/g, '.')}`;
}

function calculateProgress(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const t = nowTimestamp.value;

  if (s === e) return 100;
  const progress = ((t - s) / (e - s)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

function calculateDaysRemaining(end: string): number {
  const e = new Date(end).getTime();
  const t = new Date(today.value).getTime();
  return Math.ceil((e - t) / (1000 * 60 * 60 * 24));
}

function formatProgress(progress?: number): string {
  return `${(progress ?? 0).toFixed(5)}%`;
}

const activeEvents = computed<DisplayEvent[]>(() => {
  if (!today.value) {
    return [];
  }

  return events
    .filter((event) => today.value >= event.start && today.value <= event.end)
    .sort((a, b) => a.end.localeCompare(b.end))
    .map((event) => ({
      ...event,
      rangeText: formatRange(event.start, event.end),
      progress: calculateProgress(event.start, event.end),
      daysRemaining: calculateDaysRemaining(event.end),
    }));
});

const upcomingEvents = computed<DisplayEvent[]>(() => {
  if (!today.value) {
    return [];
  }

  return events
    .filter((event) => event.start > today.value)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 3)
    .map((event) => ({
      ...event,
      rangeText: formatRange(event.start, event.end),
    }));
});

const displayDate = computed(() =>
  today.value ? today.value.replace(/-/g, ' / ') : '',
);
</script>

<template>
  <ClientOnly>
    <section class="ongoing-container">
      <header class="header-section">
        <div class="title-group">
          <h1 class="main-title">
            正在发生
            <span class="badge">Live</span>
            <span v-if="activeEvents.length" class="count-badge">
              {{ activeEvents.length }}
            </span>
          </h1>
          <p class="description">
            What's going on?
            <br />
            点击事件卡片可一键直达对应页面
          </p>
        </div>

        <div class="current-date-card">
          <div class="date-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </div>
          <div class="date-info">
            <span class="label">今日日期</span>
            <span class="value">{{ displayDate }}</span>
          </div>
        </div>
      </header>

      <div v-if="!ready" class="loading-state">
        <div class="spinner"></div>
        <span>同步校历数据中...</span>
      </div>

      <template v-else>
        <div class="content-grid">
          <!-- Active Events Section -->
          <section class="events-section">
            <div v-if="activeEvents.length" class="events-list">
              <LinkCard
                v-for="event in activeEvents"
                :key="`${event.title}-${event.start}`"
                :href="event.href"
                :title="event.title"
                class="active-card"
                style="--card-title-size: 19px; --card-title-weight: 700"
              >
                <template #right>
                  <div class="right">
                    <div class="range">{{ event.rangeText }}</div>

                    <div
                      v-if="event.daysRemaining !== undefined"
                      class="countdown"
                    >
                      剩 {{ event.daysRemaining }} 天
                    </div>
                  </div>
                </template>
                <template #title-suffix>
                  <div class="tags">
                    <span v-for="c in event.campus" :key="c" class="campus-tag">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path
                          d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                        />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {{ c }}
                    </span>
                  </div>
                </template>

                <p v-if="event.note" class="event-note">{{ event.note }}</p>

                <template #footer>
                  <div class="progress-row">
                    <div class="progress-container">
                      <div
                        class="progress-bar"
                        :style="{ width: `${event.progress}%` }"
                      />
                    </div>
                    <span class="progress-text">
                      {{ formatProgress(event.progress) }}
                    </span>
                  </div>
                  <div class="action-link">
                    <span>查看详情</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M7 7h10v10" />
                      <path d="M7 17 17 7" />
                    </svg>
                  </div>
                </template>
              </LinkCard>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon">☕</div>
              <p>当前暂无正在进行的特定事项</p>
            </div>
          </section>

          <!-- Upcoming Events Section -->
          <section v-if="upcomingEvents.length" class="events-section upcoming">
            <h2>近期预告</h2>

            <div class="events-list compact">
              <LinkCard
                v-for="event in upcomingEvents"
                :key="`${event.title}-${event.start}`"
                :href="event.href"
                :title="event.title"
                class="upcoming-card"
                style="--card-header-align: center"
              >
                <template #right>
                  <div class="range">
                    {{ event.rangeText }}
                  </div>
                  <div class="upcoming-indicator">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                </template>
              </LinkCard>
            </div>
          </section>
        </div>
      </template>
    </section>
  </ClientOnly>
</template>

<style scoped>
.ongoing-container {
  --accent-color: var(--vp-c-brand-1);
  --accent-soft: var(--vp-c-brand-soft);
  --bg-card: var(--vp-c-bg-soft);
  --text-main: var(--vp-c-text-1);
  --text-mute: var(--vp-c-text-2);
  --border-color: var(--vp-c-divider);

  display: flex;
  flex-direction: column;
  gap: 32px;
  font-family: var(--vp-font-family-base, sans-serif);
}

/* Header Styles */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}

.main-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  background: #ef4444;
  color: white;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
  animation: pulse-bg 2s infinite;
}

@keyframes pulse-bg {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

.description {
  margin: 8px 0 0;
  color: var(--text-mute);
  font-size: 15px;
}

.current-date-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.date-icon {
  color: var(--accent-color);
  background: var(--accent-soft);
  padding: 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-info {
  display: flex;
  flex-direction: column;
}

.date-info .label {
  font-size: 12px;
  color: var(--text-mute);
  font-weight: 500;
}

.date-info .value {
  font-size: 16px;
  font-weight: 600;
  font-family: var(--vp-font-family-mono, monospace);
}

/* Section Common Styles */
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.pulse {
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.count-badge {
  font-size: 14px;
  background: var(--accent-soft);
  color: var(--accent-color);
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
  margin-left: 8px;
}

/* Event Card Styles */
.events-list {
  display: grid;
  gap: 16px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.campus-tag {
  font-size: 12px;
  color: var(--text-mute);
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 6px;
}

.dark .campus-tag {
  background: rgba(255, 255, 255, 0.05);
}

.countdown {
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
}

.event-note {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--text-mute);
  line-height: 1.6;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-container {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  overflow: hidden;
}

.dark .progress-container {
  background: rgba(255, 255, 255, 0.1);
}

.progress-bar {
  height: 100%;
  background: var(--accent-color);
  border-radius: 3px;
  transition: width 1s ease-out;
}

.progress-text {
  min-width: 44px;
  text-align: right;
  font-size: 12px;
  color: var(--text-mute);
  font-weight: 600;
  font-family: var(--vp-font-family-mono, monospace);
}

.action-link {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-color);
}

.action-link svg {
  transition: transform 0.2s ease;
}

/* Upcoming Card Styles */
.upcoming-indicator {
  color: var(--text-mute);
  opacity: 0.5;
}

/* States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
  color: var(--text-mute);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--accent-soft);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  padding: 40px;
  text-align: center;
  background: var(--bg-card);
  border: 1px dashed var(--border-color);
  border-radius: 20px;
  color: var(--text-mute);
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

/* Responsive Styles */
.content-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

@media (max-width: 840px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .current-date-card {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .ongoing-container {
    margin-top: -24px;
    gap: 24px;
  }

  .active-card {
    padding: 16px;
  }

  .right:has(.range) {
    align-items: flex-start;
    text-align: left;
  }
}

.range {
  font-size: 14px;
  font-family: var(--vp-font-family-mono, monospace);
  color: var(--vp-c-text-1);
}

.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}
</style>
