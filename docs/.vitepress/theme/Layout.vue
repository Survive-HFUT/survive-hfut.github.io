<script setup lang="ts">
// https://vitepress.dev/zh/guide/extending-default-theme#%E4%BD%BF%E7%94%A8%E8%A7%86%E5%9B%BE%E8%BF%87%E6%B8%A1-api

// @ts-expect-error
import { data } from '../data/metadata.data';

import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
} from '@nolebase/vitepress-plugin-enhanced-readabilities';
import mediumZoom from 'medium-zoom';
import { inBrowser, useData, useRoute } from 'vitepress';
import { createMermaidRenderer } from 'vitepress-mermaid-renderer';
import giscusTalk from 'vitepress-plugin-comment-with-giscus';
import DefaultTheme from 'vitepress/theme';
import { nextTick, onBeforeMount, onMounted, provide, ref, watch } from 'vue';
import locales from '../i18n/locales';
import CustomHeroInfo from './components/CustomHeroInfo.vue';

const { Layout } = DefaultTheme;
const route = useRoute();
const { frontmatter, isDark } = useData();
const isTransitionsEnabled = ref(false);

// 强制在浏览器内判断是否支持视图过渡 API，以避免在SSG时出现错误
// https://vitepress.dev/zh/guide/ssr-compat
onBeforeMount(
  () =>
    (isTransitionsEnabled.value =
      'startViewTransition' in document &&
      window.matchMedia('(prefers-reduced-motion: no-preference)').matches),
);

onMounted(() => {
  if (!inBrowser || typeof document === 'undefined') {
    return;
  }

  console.debug('Metadata:', data);

  document.documentElement.classList.toggle(
    'transitions-enabled',
    isTransitionsEnabled.value,
  );
});

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!isTransitionsEnabled.value) {
    isDark.value = !isDark.value;
    return;
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )}px at ${x}px ${y}px)`,
  ];

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value;
    await nextTick();
  }).ready;

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      fill: 'forwards',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`,
    },
  );
});

const initMermaid = () =>
  createMermaidRenderer({
    theme: isDark.value ? 'dark' : 'base',
  }).setToolbar({
    showLanguageLabel: false,
    i18n: { tooltips: locales.mermaidToolbarText },
  });
nextTick(() => initMermaid());
watch(
  () => isDark.value,
  () => initMermaid(),
);

// 初始化Medium Zoom
const initZoom = () =>
  mediumZoom('.main img:not(a *)', { background: 'var(--vp-c-bg)' });
onMounted(initZoom);
watch(
  () => route.path,
  () => nextTick(initZoom),
);

giscusTalk(
  {
    repo: 'Survive-HFUT/survive-hfut.github.io',
    repoId: 'R_kgDOKE2TfA',
    category: 'Giscus',
    categoryId: 'DIC_kwDOKE2TfM4CqW7d',
    mapping: 'pathname',
    inputPosition: 'top',
    lang: 'zh-CN',
    lightTheme: 'light',
    darkTheme: 'transparent_dark',
  },
  {
    frontmatter,
    route,
  },
  true,
);
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <NolebaseEnhancedReadabilitiesMenu />
    </template>

    <template #nav-screen-content-after>
      <NolebaseEnhancedReadabilitiesScreenMenu />
    </template>

    <template #home-hero-info>
      <CustomHeroInfo />
    </template>
  </Layout>
</template>

<style>
@import './styles/index.css';

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.transitions-enabled .VPSwitchAppearance {
  width: 22px !important;
}

.transitions-enabled .VPSwitchAppearance .check {
  transform: none !important;
}

.has-home-hero-bg .VPContent.is-home {
  position: relative;
  isolation: isolate;
  background: var(--vp-c-bg);
}

.has-home-hero-bg .VPContent.is-home > * {
  position: relative;
  z-index: 1;
}

.has-home-hero-bg .VPContent.is-home::before,
.has-home-hero-bg .VPContent.is-home::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
  pointer-events: none;
  transition: opacity 900ms ease;
}

.has-home-hero-bg .VPContent.is-home::before {
  opacity: 1;
  background-image:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--vp-c-bg) 82%, transparent) 0%,
      color-mix(in srgb, var(--vp-c-bg) 58%, transparent) 42%,
      color-mix(in srgb, var(--vp-c-bg) 68%, transparent) 100%
    ),
    var(--home-hero-bg-image-a);
}

.has-home-hero-bg .VPContent.is-home::after {
  opacity: 0;
  background-image:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--vp-c-bg) 82%, transparent) 0%,
      color-mix(in srgb, var(--vp-c-bg) 58%, transparent) 42%,
      color-mix(in srgb, var(--vp-c-bg) 68%, transparent) 100%
    ),
    var(--home-hero-bg-image-b);
}

.has-home-hero-bg.home-hero-bg-b-active .VPContent.is-home::before {
  opacity: 0;
}

.has-home-hero-bg.home-hero-bg-b-active .VPContent.is-home::after {
  opacity: 1;
}

.has-home-hero-bg .VPNavBar:not(.home.top) {
  background: color-mix(in srgb, var(--vp-c-bg) 88%, transparent);
}

.has-home-hero-bg {
  --vp-home-hero-image-background-image: none;
  --vp-home-hero-image-filter: none;
}

.has-home-hero-bg .VPFeature .box {
  background: color-mix(in srgb, var(--vp-c-bg-soft) 84%, transparent);
  backdrop-filter: blur(10px);
}
</style>
