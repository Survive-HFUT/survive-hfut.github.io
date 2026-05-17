<script setup lang="ts">
import { useRouter } from 'vitepress';

// @ts-expect-error
import { data } from '../../data/sidebar.data';
import { onMounted } from 'vue';

const url = data[Math.floor(Math.random() * data.length)];
onMounted(() => useRouter().go(url[0]));
</script>

<template>
  <div class="container">
    <div class="loading-container">
      <div class="loading"></div>
    </div>

    <div class="loading-text">
      <span
        v-for="(c, i) in '努力加载中……'"
        :style="{
          'animation-delay': `${i * 0.05}s`,
        }"
      >
        {{ c }}
      </span>
    </div>

    <div class="tip">
      <span>如果长时间未跳转，请尝试刷新页面或</span>
      <a :href="url[0]">直接跳转</a>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 75vh;
}

.loading-container {
  height: 50px;
}

.loading,
.loading:before,
.loading:after {
  width: 6px;
  height: 15px;
  content: '';
  background-color: var(--vp-c-text-1);
}

.loading:before,
.loading:after {
  position: absolute;
  content: '';
}

.loading {
  display: block;
  position: relative;
  animation: rectangle infinite 1s ease-in-out -0.2s;
}
.loading:before {
  left: -14px;
  animation: rectangle infinite 1s ease-in-out -0.4s;
}

.loading:after {
  right: -14px;
  animation: rectangle infinite 1s ease-in-out;
}

.loading-text {
  margin: 16px 0;
}

.loading-text span {
  animation: sparkle infinite 1s ease-in-out;
}

.tip {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.tip a {
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition:
    color 0.25s,
    opacity 0.25s;
}

@keyframes rectangle {
  0%,
  80%,
  100% {
    height: 20px;
    box-shadow: 0 0 var(--vp-c-text-1);
  }

  40% {
    height: 30px;
    box-shadow: 0 -20px var(--vp-c-text-1);
  }
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
