import { NolebaseGitChangelogPlugin } from '@nolebase/vitepress-plugin-git-changelog/client';
import { NolebaseUnlazyImg } from '@nolebase/vitepress-plugin-thumbnail-hash/client';
import mediumZoom from 'medium-zoom';
import { NProgress } from 'nprogress-v2/dist/index.js';
import { inBrowser, useRoute, type Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import vitepressBackToTop from 'vitepress-plugin-back-to-top';
import { h, nextTick, onMounted, watch } from 'vue';

import 'vitepress-plugin-back-to-top/dist/style.css';
import '@nolebase/vitepress-plugin-git-changelog/client/style.css';
import '@nolebase/vitepress-plugin-thumbnail-hash/client/style.css';
import 'nprogress-v2/dist/index.css';
import 'vitepress-markdown-timeline/dist/theme/index.css';
import './style.css';

export default {
  extends: DefaultTheme,

  Layout: () => h(DefaultTheme.Layout, null, {}),

  setup: () => {
    const route = useRoute();
    const initZoom = () => {
      mediumZoom('.main img:not(a *)', { background: 'var(--vp-c-bg)' });
    };
    onMounted(() => {
      initZoom();
    });
    watch(
      () => route.path,
      () => nextTick(() => initZoom()),
    );
  },

  enhanceApp({ app, router }) {
    vitepressBackToTop({
      threshold: 300,
    });

    app.component('NolebaseUnlazyImg', NolebaseUnlazyImg);
    app.use(NolebaseGitChangelogPlugin);

    if (inBrowser) {
      NProgress.configure({ showSpinner: false });
      router.onBeforeRouteChange = () => {
        NProgress.start();
      };
      router.onAfterRouteChange = () => {
        NProgress.done();
      };
    }
  },
} satisfies Theme;
