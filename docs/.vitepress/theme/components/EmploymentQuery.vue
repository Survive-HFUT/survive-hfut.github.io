<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import employmentData from '../../../more/media/employment_query.json';

interface Record {
  发布时间: string;
  毕业年份: string;
  专业: string;
  code: string;
  学历: string;
  单位: string;
  岗位: string;
  薪资: string;
  留言: string;
}

const records = (employmentData as Record[]).slice();

const keyword = ref('');
const currentPage = ref(1);
const pageSize = 20;

// 关键词按中文逗号、英文逗号、顿号、空格分割
const tokens = computed(() =>
  keyword.value
    .trim()
    .split(/[，,、\s]+/)
    .map((t) => t.toLowerCase())
    .filter(Boolean),
);

// 过滤：所有关键词都需命中记录的全部属性值
const filteredRaw = computed(() => {
  const ts = tokens.value;
  if (ts.length === 0) return records;
  return records.filter((r) => {
    const hay = Object.values(r).join(' ').toLowerCase();
    return ts.every((t) => hay.includes(t));
  });
});

// Fisher-Yates 洗牌
const shuffle = (arr: Record[]): Record[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// 搜索结果随机排序：关键词变化时重新洗牌，翻页保持稳定
const filtered = ref<Record[]>([]);
watch(
  filteredRaw,
  (list) => {
    filtered.value = shuffle(list);
    currentPage.value = 1;
  },
  { immediate: true },
);

const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize) || 1);

const paged = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

const goToPage = (p: number) => {
  if (p < 1 || p > totalPages.value) return;
  currentPage.value = p;
};

// 归一化毕业年份为 4 位数字
const normalizeYear = (raw: string): string => {
  const m = (raw || '').match(/\d{4}/);
  return m ? m[0] : '';
};
</script>

<template>
  <div class="employment-query">
    <div class="filter-panel">
      <div class="form-group">
        <label for="kw">关键词</label>
        <input
          id="kw"
          type="text"
          v-model="keyword"
          placeholder="搜索全部字段，支持空格 / 逗号 / 顿号分隔多关键词"
        />
      </div>
    </div>

    <div class="result-count">
      共找到 <span class="count-num">{{ filtered.length }}</span> 条记录
    </div>

    <div v-if="filtered.length === 0" class="empty">
      没有符合条件的记录
    </div>

    <div v-else class="card-list">
      <div v-for="(r, i) in paged" :key="i" class="card">
        <div class="card-head">
          <span class="major">{{ r.专业 || '未知专业' }}</span>
          <span v-if="r.发布时间" class="date">{{ r.发布时间 }}</span>
          <span v-if="r.code" class="code">{{ r.code }}</span>
        </div>
        <div class="card-body">
          <span v-if="normalizeYear(r.毕业年份)" class="tag body-tag">{{ normalizeYear(r.毕业年份) }}届</span>
          <span v-if="r.学历" class="tag body-tag">{{ r.学历 }}</span>
          <span v-if="r.单位" class="tag body-tag">{{ r.单位 }}</span>
          <span v-if="r.岗位" class="tag body-tag">{{ r.岗位 }}</span>
          <span v-if="r.薪资" class="tag body-tag">{{ r.薪资 }}</span>
        </div>
        <div v-if="r.留言" class="message">{{ r.留言 }}</div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        上一页
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.employment-query {
  margin: 20px auto;
}

.filter-panel {
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 13px;
  color: var(--vp-c-text-1);
  user-select: none;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.result-count {
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.count-num {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 14px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
}

.card-list {
  column-count: 2;
  column-gap: 14px;
}

.card {
  break-inside: avoid;
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.card:hover {
  border-color: var(--vp-c-brand-1);
}

.card-head {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  z-index: 0;
}

.major {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  word-break: break-word;
}

.date {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

.code{
  position: absolute;
  top: 0;
  left: -15px;
  font-size: 60px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--vp-c-bg-soft);
  font-style: italic;
  z-index: -1;
}

.card-body {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--vp-c-divider);
}

.body-tag {
  font-size: 12px;
  line-height: 1.5;
  padding: 3px 8px;
  border-radius: 4px;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}

.message {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  white-space: pre-wrap;
  word-break: break-word;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.page-btn {
  padding: 6px 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .card-list {
    column-count: 1;
  }
}
</style>
