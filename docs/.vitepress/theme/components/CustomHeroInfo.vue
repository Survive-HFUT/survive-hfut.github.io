<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { inBrowser, useData } from 'vitepress';

const { frontmatter, isDark } = useData();

type HeroVariant = {
  name: string;
  text: string;
};

const variants = computed<HeroVariant[]>(() => {
  const rawNames = normalizeStrings(frontmatter.value.hero?.names);
  const rawTexts = normalizeStrings(frontmatter.value.hero?.texts);

  if (rawNames.length > 0 || rawTexts.length > 0) {
    const length = Math.max(rawNames.length, rawTexts.length);

    return Array.from({ length }, (_, index) => ({
      name:
        rawNames.length > 0
          ? (rawNames[index % rawNames.length] ?? '')
          : (frontmatter.value.hero?.name ?? ''),
      text:
        rawTexts.length > 0
          ? (rawTexts[index % rawTexts.length] ?? '')
          : (frontmatter.value.hero?.text ?? ''),
    })).filter((item) => item.name.length > 0 || item.text.length > 0);
  }

  return frontmatter.value.hero?.name || frontmatter.value.hero?.text
    ? [
        {
          name: frontmatter.value.hero?.name ?? '',
          text: frontmatter.value.hero?.text ?? '',
        },
      ]
    : [];
});
const displayedName = ref(
  variants.value[0]?.name ?? frontmatter.value.hero?.name ?? '',
);
const displayedText = ref('');
const activeTextForImage = ref(
  variants.value[0]?.text ?? frontmatter.value.hero?.text ?? '',
);
const hasTexts = computed(
  () =>
    Array.isArray(frontmatter.value.hero?.texts) &&
    frontmatter.value.hero.texts.length > 0,
);
const hasFallbackText = computed(() => !!frontmatter.value.hero?.text);
const showText = computed(() => hasTexts.value || hasFallbackText.value);

const bgImageMap: Record<string, string> = {
  xuanhua: new URL('../../../media/east_gate_new.jpg', import.meta.url).href,
  feicui: new URL('../../../campus/fch/dongfengguangchang.jpg', import.meta.url)
    .href,
  tunxi: new URL(
    '../../../campus/txl/main_academic_building.png',
    import.meta.url,
  ).href,
};

const isInitialDelayPassed = ref(false);
let pendingBgUrl = '';

const currentBgImage = computed(() => {
  if (isDark.value) {
    return '';
  }
  const text = activeTextForImage.value || displayedText.value || '';
  if (text.includes('薰化路')) return bgImageMap.xuanhua;
  if (text.includes('翡翠')) return bgImageMap.feicui;
  if (text.includes('屯溪路')) return bgImageMap.tunxi;
  return '';
});

let activeBgLayer: 'a' | 'b' = 'a';
let activeBgUrl = '';

watch(
  currentBgImage,
  (url) => {
    if (!inBrowser || typeof window === 'undefined') {
      return;
    }

    if (!url || isDark.value) {
      clearHomeBg();
      pendingBgUrl = '';
      return;
    }

    if (typeof Image === 'undefined') {
      setHomeBg(url);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (!isDark.value) {
        setHomeBg(url);
      } else {
        clearHomeBg();
      }
    };
    img.onerror = () => {
      clearHomeBg();
    };
    img.src = url;
  },
  { immediate: true },
);

let stopped = false;

// 打乱数组顺序
function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 随机上下浮动
function jitter(baseMs: number, ratio = 0.5) {
  const min = baseMs * (1 - ratio);
  const max = baseMs * (1 + ratio);
  return Math.round(min + Math.random() * (max - min));
}

function normalizeStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item: unknown): item is string => typeof item === 'string',
  );
}

function setHomeBg(url: string) {
  if (!isInitialDelayPassed.value) {
    pendingBgUrl = url;
    return;
  }

  if (url === activeBgUrl) {
    return;
  }

  const root = document.documentElement;
  const cssUrl = `url("${url}")`;

  if (!root.classList.contains('has-home-hero-bg')) {
    activeBgLayer = 'a';
    root.style.setProperty('--home-hero-bg-image-a', cssUrl);
    root.style.setProperty('--home-hero-bg-image-b', cssUrl);
    root.classList.remove('home-hero-bg-b-active');
  } else if (activeBgLayer === 'a') {
    activeBgLayer = 'b';
    root.style.setProperty('--home-hero-bg-image-b', cssUrl);
    root.classList.add('home-hero-bg-b-active');
  } else {
    activeBgLayer = 'a';
    root.style.setProperty('--home-hero-bg-image-a', cssUrl);
    root.classList.remove('home-hero-bg-b-active');
  }

  activeBgUrl = url;
  document.documentElement.classList.add('has-home-hero-bg');
}

function clearHomeBg() {
  const root = document.documentElement;
  root.style.removeProperty('--home-hero-bg-image-a');
  root.style.removeProperty('--home-hero-bg-image-b');
  root.classList.remove('has-home-hero-bg', 'home-hero-bg-b-active');
  activeBgUrl = '';
  activeBgLayer = 'a';
  pendingBgUrl = '';
}

// 打字机效果
async function runTypewriter() {
  const items = shuffle(variants.value);

  if (items.length === 0) {
    displayedName.value = frontmatter.value.hero?.name ?? '';
    displayedText.value = frontmatter.value.hero?.text ?? '';
    return;
  }

  displayedName.value = items[0]?.name ?? frontmatter.value.hero?.name ?? '';

  let index = 0;
  while (!stopped) {
    const current = items[index] ?? { name: '', text: '' };
    displayedName.value = current.name || frontmatter.value.hero?.name || '';
    activeTextForImage.value =
      current.text || frontmatter.value.hero?.text || '';

    for (let i = 0; i <= current.text.length && !stopped; i += 1) {
      displayedText.value = current.text.slice(0, i);
      await sleep(jitter(90));
    }

    await sleep(2500);

    for (let i = current.text.length; i >= 0 && !stopped; i -= 1) {
      displayedText.value = current.text.slice(0, i);
      await sleep(jitter(50));
    }

    await sleep(300);

    index += 1;
    if (index >= items.length) {
      index = 0;
    }
  }
}

onMounted(() => {
  stopped = false;
  if (inBrowser && typeof document !== 'undefined') {
    document.documentElement.classList.add('is-home-layout');
  }
  runTypewriter();
  window.setTimeout(() => {
    isInitialDelayPassed.value = true;
    if (!stopped && !isDark.value) {
      if (pendingBgUrl) {
        setHomeBg(pendingBgUrl);
        pendingBgUrl = '';
      } else if (currentBgImage.value) {
        setHomeBg(currentBgImage.value);
      }
    }
  }, 1500);
});

onBeforeUnmount(() => {
  stopped = true;
  if (inBrowser && typeof window !== 'undefined') {
    clearHomeBg();
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('is-home-layout');
    }
  }
});
</script>
<template>
  <h1 class="heading">
    <span
      v-if="displayedName || frontmatter.hero?.name"
      v-html="displayedName || frontmatter.hero?.name"
      class="name clip"
    ></span>
    <span v-if="showText" class="text">
      <span class="text-content" v-html="displayedText"></span>
      <span class="cursor" aria-hidden="true">_</span>
    </span>
  </h1>
  <p
    v-if="frontmatter.hero?.tagline"
    v-html="frontmatter.hero.tagline"
    class="tagline"
  ></p>
</template>

<style scoped>
/**
  From: https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/components/VPHero.vue
 */
.heading {
  display: flex;
  flex-direction: column;
}

.name,
.text {
  width: fit-content;
  max-width: 392px;
  letter-spacing: -0.4px;
  line-height: 40px;
  font-weight: 700;
  white-space: nowrap;
  word-break: keep-all;

  &:lang(ja) {
    font-feature-settings: 'palt';
    word-break: auto-phrase;
  }
}

.name {
  font-size: 32px;
}

.text {
  font-size: 28px;
}

.text-content {
  display: inline-block;
}

.cursor {
  display: inline-block;
  margin-left: 2px;
  animation: cursor-blink 1s steps(1) infinite;
}

@keyframes cursor-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

.VPHero.has-image .name,
.VPHero.has-image .text {
  margin: 0 auto;
}

.name {
  color: var(--vp-home-hero-name-color);
}

.clip {
  background: var(--vp-home-hero-name-background);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: var(--vp-home-hero-name-color);
}

@media (min-width: 640px) {
  .name,
  .text {
    max-width: 576px;
    line-height: 56px;
    font-size: 48px;
  }
}

@media (min-width: 960px) {
  .name,
  .text {
    line-height: 64px;
    font-size: 56px;
  }

  .VPHero.has-image .name,
  .VPHero.has-image .text {
    margin: 0;
  }
}

.tagline {
  padding-top: 8px;
  max-width: 392px;
  line-height: 28px;
  font-size: 18px;
  font-weight: 500;
  white-space: pre-wrap;
  color: var(--vp-c-text-2);
}

.VPHero.has-image .tagline {
  margin: 0 auto;
}

@media (min-width: 640px) {
  .tagline {
    padding-top: 12px;
    max-width: 576px;
    line-height: 32px;
    font-size: 20px;
  }
}

@media (min-width: 960px) {
  .tagline {
    line-height: 36px;
    font-size: 24px;
  }

  .VPHero.has-image .tagline {
    margin: 0;
  }
}
</style>
