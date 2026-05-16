<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { data, type OngoingEvent } from '../../data/ongoing.data';

type DisplayEvent = OngoingEvent & {
  rangeText: string;
};

const events = data.events;

const ready = ref(false);
const today = ref('');

onMounted(() => {
  today.value = getShanghaiDateKey();
  ready.value = true;
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
    <section class="ongoing-wrap">
      <header class="hero">
        <div>
          <h2>当前时间段里正在进行的学校事项</h2>
          <p class="lead">
            按上海时间自动匹配今天所在的时间窗口，点卡片可直接跳转到对应页面。
          </p>
        </div>
        <div class="date-box">
          <span class="date-label">今天</span>
          <strong>{{ displayDate }}</strong>
        </div>
      </header>

      <div v-if="!ready" class="state">正在加载今天的时间节点...</div>

      <template v-else>
        <section class="section">
          <div class="section-head">
            <h2>正在发生</h2>
            <span class="count">{{ activeEvents.length }} 项</span>
          </div>

          <div v-if="activeEvents.length" class="list">
            <a
              v-for="event in activeEvents"
              :key="`${event.title}-${event.start}`"
              class="item"
              :href="event.href"
            >
              <div class="item-head">
                <div>
                  <h3>{{ event.title }}</h3>
                  <div class="campus">
                    <span v-for="c in event.campus" :key="c">
                      {{ c }}
                    </span>
                  </div>
                </div>
                <span class="range">{{ event.rangeText }}</span>
              </div>
              <p v-if="event.note" class="note">{{ event.note }}</p>
              <span class="jump">直接跳转</span>
            </a>
          </div>

          <p v-else class="state">
            今天没有命中的节点，下面是接下来会开始的事项。
          </p>
        </section>

        <section v-if="upcomingEvents.length" class="section">
          <div class="section-head">
            <h2>近期将开始</h2>
          </div>

          <div class="list compact">
            <a
              v-for="event in upcomingEvents"
              :key="`${event.title}-${event.start}`"
              class="item"
              :href="event.href"
            >
              <div class="item-head">
                <div>
                  <h3>{{ event.title }}</h3>
                  <div class="campus">
                    <span v-for="c in event.campus" :key="c">
                      {{ c }}
                    </span>
                  </div>
                </div>
                <span class="range">{{ event.rangeText }}</span>
              </div>
              <p v-if="event.note" class="note">{{ event.note }}</p>
            </a>
          </div>
        </section>
      </template>
    </section>
  </ClientOnly>
</template>

<style scoped>
.ongoing-wrap {
  display: grid;
  gap: 24px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-end;
  padding: 20px 0 6px;
}

.lead {
  margin: 12px 0 0;
  max-width: 44rem;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.date-box {
  min-width: 160px;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  text-align: right;
}

.date-label {
  display: block;
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.date-box strong {
  font-size: 18px;
}

.section {
  display: grid;
  gap: 14px;
}

.count {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.state {
  margin: 0;
  padding: 16px 18px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 14px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}

.list {
  display: grid;
  gap: 18px;
}

.item {
  display: block;
  padding: 16px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  color: var(--vp-c-text-1);
  text-decoration: none;
  background: var(--vp-c-bg-soft);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.item:hover {
  border-color: var(--vp-c-brand-1);
  background: color-mix(
    in srgb,
    var(--vp-c-bg-soft) 90%,
    var(--vp-c-brand-soft)
  );
}

.item-head {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: flex-start;
}

.item h3 {
  margin: 0;
  font-size: 18px;
  line-height: 1.35;
}

.campus,
.note,
.range,
.jump {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.campus {
  margin: 6px 0;
}

.campus > span {
  margin-right: 3px;
}

.range {
  white-space: nowrap;
}

.note {
  margin: 10px 0 0;
  line-height: 1.7;
}

.jump {
  display: inline-block;
  margin-top: 10px;
  color: var(--vp-c-brand-1);
}

.compact .jump {
  display: none;
}

@media (max-width: 720px) {
  .hero,
  .item-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-box {
    width: 100%;
    text-align: left;
  }

  .range {
    white-space: normal;
  }
}
</style>
