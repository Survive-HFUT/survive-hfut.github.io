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
import CampusSwitch from './components/CampusSwitch.vue';
import CustomHeroInfo from './components/CustomHeroInfo.vue';
import Footer from './components/Footer.vue';
import Toast from './components/Toast.vue';

const { Layout } = DefaultTheme;
const route = useRoute();
const { frontmatter, isDark } = toRefs(useData());
const isTransitionsEnabled = ref(false);

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

{
  let activeAppearanceTransition: ViewTransition | null = null;
  let appearanceToggleId = 0;
  let requestedDark: boolean | null = null;

  // 强制在浏览器内判断是否支持视图过渡 API，以避免在SSG时出现错误
  // https://vitepress.dev/zh/guide/extending-default-theme#%E4%BD%BF%E7%94%A8%E8%A7%86%E5%9B%BE%E8%BF%87%E6%B8%A1-api
  // https://vitepress.dev/zh/guide/ssr-compat
  onBeforeMount(
    () =>
      (isTransitionsEnabled.value =
        'startViewTransition' in document &&
        window.matchMedia('(prefers-reduced-motion: no-preference)').matches),
  );

  provide(
    'toggle-appearance',
    async ({ clientX: x, clientY: y }: MouseEvent) => {
      requestedDark = !(requestedDark ?? isDark.value);
      const targetDark = requestedDark;

      if (!isTransitionsEnabled.value) {
        isDark.value = targetDark;
        return;
      }

      const toggleId = ++appearanceToggleId;

      // 新的切换接管旧动画，避免连续点击时堆积多个全屏视图过渡。
      const interruptedTransition = activeAppearanceTransition;
      interruptedTransition?.skipTransition();

      if (interruptedTransition) {
        try {
          // 等待浏览器清理旧快照树，不能在 skipTransition() 后立即开启新过渡。
          await interruptedTransition.finished;
        } catch {
          // 旧过渡已经被取代，清理失败不影响最新主题请求。
        }

        if (toggleId !== appearanceToggleId) {
          return;
        }
      }

      const radius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y),
      );
      const transitionDirection = targetDark ? 'to-dark' : 'to-light';
      document.documentElement.dataset.appearanceTransition =
        transitionDirection;
      document.documentElement.style.setProperty(
        '--appearance-transition-x',
        `${x}px`,
      );
      document.documentElement.style.setProperty(
        '--appearance-transition-y',
        `${y}px`,
      );
      document.documentElement.style.setProperty(
        '--appearance-transition-radius',
        `${radius}px`,
      );

      const clearTransitionDirection = () => {
        if (
          document.documentElement.dataset.appearanceTransition ===
          transitionDirection
        ) {
          delete document.documentElement.dataset.appearanceTransition;
          document.documentElement.style.removeProperty(
            '--appearance-transition-x',
          );
          document.documentElement.style.removeProperty(
            '--appearance-transition-y',
          );
          document.documentElement.style.removeProperty(
            '--appearance-transition-radius',
          );
        }
      };

      const transition = document.startViewTransition(async () => {
        // 被更新的点击取代后，旧过渡仍可能执行回调，此时不再改写主题。
        if (toggleId !== appearanceToggleId) {
          return;
        }

        isDark.value = targetDark;
        await nextTick();
      });
      activeAppearanceTransition = transition;

      try {
        await transition.ready;
      } catch {
        // skipTransition() 会拒绝 ready；这是连续点击时的预期行为。
        if (activeAppearanceTransition === transition) {
          activeAppearanceTransition = null;
        }
        clearTransitionDirection();
        return;
      }

      if (toggleId !== appearanceToggleId) {
        transition.skipTransition();
        try {
          await transition.finished;
        } catch {
          // 新点击会继续处理最终主题状态。
        }
        if (activeAppearanceTransition === transition) {
          activeAppearanceTransition = null;
        }
        clearTransitionDirection();
        return;
      }

      try {
        await transition.finished;
      } catch {
        // 主题已完成切换，过渡收尾失败时无需继续向外抛出异常。
      } finally {
        if (activeAppearanceTransition === transition) {
          activeAppearanceTransition = null;
        }
        clearTransitionDirection();
      }
    },
  );
}

// 初始化Mermaid
{
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
}

// 初始化Medium Zoom
{
  const initZoom = () =>
    mediumZoom('main img:not(a *)', { background: 'var(--vp-c-bg)' });
  onMounted(initZoom);
  watch(
    () => route.path,
    () => nextTick(initZoom),
  );
}

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
    <template #sidebar-nav-before>
      <CampusSwitch />
    </template>

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

[data-appearance-transition='to-dark']::view-transition-old(root),
[data-appearance-transition='to-light']::view-transition-new(root) {
  z-index: 9999;
}

[data-appearance-transition='to-dark']::view-transition-old(root) {
  animation: appearance-contract 300ms ease-in both;
}

[data-appearance-transition='to-light']::view-transition-new(root) {
  animation: appearance-expand 300ms ease-in both;
}

[data-appearance-transition='to-dark']::view-transition-new(root),
[data-appearance-transition='to-light']::view-transition-old(root) {
  z-index: 1;
}

@keyframes appearance-contract {
  from {
    clip-path: circle(
      var(--appearance-transition-radius) at var(--appearance-transition-x)
        var(--appearance-transition-y)
    );
  }

  to {
    clip-path: circle(
      0 at var(--appearance-transition-x) var(--appearance-transition-y)
    );
  }
}

@keyframes appearance-expand {
  from {
    clip-path: circle(
      0 at var(--appearance-transition-x) var(--appearance-transition-y)
    );
  }

  to {
    clip-path: circle(
      var(--appearance-transition-radius) at var(--appearance-transition-x)
        var(--appearance-transition-y)
    );
  }
}

.transitions-enabled .VPSwitchAppearance {
  width: 22px !important;
}

.transitions-enabled .VPSwitchAppearance .check {
  transform: none !important;
}
</style>
