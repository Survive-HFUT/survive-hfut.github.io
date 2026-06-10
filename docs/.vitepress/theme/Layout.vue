<script setup lang="ts">
import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
} from '@nolebase/vitepress-plugin-enhanced-readabilities';
import mediumZoom from 'medium-zoom';
import { inBrowser, useData, useRoute } from 'vitepress';
import { createMermaidRenderer } from 'vitepress-mermaid-renderer';
import giscusTalk from 'vitepress-plugin-comment-with-giscus';
import DefaultTheme from 'vitepress/theme';
import {
  nextTick,
  onBeforeMount,
  onMounted,
  provide,
  ref,
  toRefs,
  watch,
} from 'vue';
import { data } from '../data/metadata.data';
import locales from '../i18n/locales';
import CustomHeroInfo from './components/CustomHeroInfo.vue';
import Footer from './components/Footer.vue';
import Toast from './components/Toast.vue';

const { Layout } = DefaultTheme;
const route = useRoute();
const { frontmatter, isDark } = toRefs(useData());
const isTransitionsEnabled = ref(false);

// 强制在浏览器内判断是否支持视图过渡 API，以避免在SSG时出现错误
// https://vitepress.dev/zh/guide/extending-default-theme#%E4%BD%BF%E7%94%A8%E8%A7%86%E5%9B%BE%E8%BF%87%E6%B8%A1-api
// https://vitepress.dev/zh/guide/ssr-compat
onBeforeMount(
  () =>
    (isTransitionsEnabled.value =
      'startViewTransition' in document &&
      window.matchMedia('(prefers-reduced-motion: no-preference)').matches),
);

const showToast = ref(false);
const toastMessage = ref('');

onMounted(() => {
  if (!inBrowser || typeof document === 'undefined') {
    return;
  }

  console.debug('Metadata:', data);

  document.documentElement.classList.toggle(
    'transitions-enabled',
    isTransitionsEnabled.value,
  );

  // 检查是否是从 DeepLink 失败回退回来的
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('deeplink_failed') === '1') {
    toastMessage.value = '你还没有安装最新版本的聚在工大App，暂不支持跳转';
    showToast.value = true;

    // 3秒后隐藏
    setTimeout(() => {
      showToast.value = false;
    }, 3000);

    // 清理 URL 上的参数，保持整洁
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', cleanUrl);
  }
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

// 初始化Mermaid
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
  mediumZoom('main img:not(a *)', { background: 'var(--vp-c-bg)' });
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

    <template #layout-bottom>
      <Footer />

      <Toast :show-toast="showToast" :toast-message="toastMessage" />
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
</style>
