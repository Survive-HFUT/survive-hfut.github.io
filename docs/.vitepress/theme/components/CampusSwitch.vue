<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { inBrowser } from 'vitepress'

type Campus = 'xc' | 'both' | 'hf'

const STORAGE_KEY = 'survive-hfut-campus'

const campus = ref<Campus>('both')
const ready = ref(false)

// 将当前校区同步到 <html data-campus>，供 CSS 按校区过滤侧边栏条目
watch(
  campus,
  (v) => {
    if (!inBrowser) return
    document.documentElement.dataset.campus = v
  },
  { immediate: true },
)

onMounted(() => {
  if (inBrowser) {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'xc' || v === 'both' || v === 'hf') {
      campus.value = v
    }
  }
  nextTick(() => {
    ready.value = true
  })
})

const switchTo = (value: Campus) => {
  campus.value = value
  if (inBrowser) {
    localStorage.setItem(STORAGE_KEY, value)
  }
}
</script>

<template>
  <div
    class="campus-switch"
    :class="{ 'mode-both': campus === 'both', 'no-anim': !ready }"
  >
    <div
      class="campus-switch-slider"
      :class="{
        'pos-0': campus === 'xc',
        'pos-1': campus === 'both',
        'pos-2': campus === 'hf',
      }"
    />
    <button
      class="campus-switch-btn"
      :class="{ active: campus === 'xc' }"
      @click="switchTo('xc')"
    >
      宣城
    </button>
    <button
      class="campus-switch-btn"
      :class="{ active: campus === 'both' }"
      @click="switchTo('both')"
    >
      双城
    </button>
    <button
      class="campus-switch-btn"
      :class="{ active: campus === 'hf' }"
      @click="switchTo('hf')"
    >
      合肥
    </button>
  </div>
</template>

<style scoped>
.campus-switch {
  position: relative;
  isolation: isolate;
  display: flex;
  /* 窄屏（移动端抽屉，< 960px）：上下外边距 */
  margin-top: 0px;
  margin-bottom: 20px;
  padding: 3px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: background-color 0.3s;
}

.campus-switch.no-anim,
.campus-switch.no-anim .campus-switch-slider {
  transition: none;
}

/* 宽屏（桌面固定侧边栏，≥ 960px）：上下外边距 */
@media (min-width: 960px) {
  .campus-switch {
    margin-top: 20px;
    margin-bottom: 10px;
  }
}

/* 双城模式：整条开关高亮（浅蓝底），白色滑块标记当前选中位 */
.campus-switch.mode-both {
  background-color: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-soft);
}

.campus-switch-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc((100% - 6px) / 3);
  height: calc(100% - 6px);
  border-radius: 6px;
  background-color: var(--vp-c-brand-soft);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s;
}

.mode-both .campus-switch-slider {
  background-color: var(--vp-c-bg);
}

.pos-0 {
  transform: translateX(0);
}

.pos-1 {
  transform: translateX(100%);
}

.pos-2 {
  transform: translateX(200%);
}

.campus-switch-btn {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 3px 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  color: var(--vp-c-text-3);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.25s;
}

.campus-switch-btn:hover {
  color: var(--vp-c-text-1);
}

.campus-switch-btn.active {
  color: var(--vp-c-brand-1);
}
</style>
