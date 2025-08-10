import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
} from '@nolebase/vitepress-plugin-enhanced-readabilities/client';
import { NolebaseGitChangelogPlugin } from '@nolebase/vitepress-plugin-git-changelog/client';
import { NolebasePagePropertiesPlugin } from '@nolebase/vitepress-plugin-page-properties';
import { NolebaseUnlazyImg } from '@nolebase/vitepress-plugin-thumbnail-hash/client';
import mediumZoom from 'medium-zoom';
import { NProgress } from 'nprogress-v2/dist/index.js';
import { inBrowser, useData, useRoute, type Theme } from 'vitepress';
import vitepressBackToTop from 'vitepress-plugin-back-to-top';
import giscusTalk from 'vitepress-plugin-comment-with-giscus';
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client';
import DefaultTheme from 'vitepress/theme';
import { h, nextTick, onMounted, toRefs, watch } from 'vue';
import locales from '../locales';
import BackToTopTip from './components/BackToTopTip.vue';
import DormitoryIdGenerator from './components/DormitoryIdGenerator.vue';
import HelpUs from './components/HelpUs.vue';
import RandomJump from './components/RandomJump.vue';

import '@nolebase/vitepress-plugin-enhanced-mark/client/style.css';
import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css';
import '@nolebase/vitepress-plugin-git-changelog/client/style.css';
import '@nolebase/vitepress-plugin-page-properties/client/style.css';
import '@nolebase/vitepress-plugin-thumbnail-hash/client/style.css';
import 'nprogress-v2/dist/index.css';
import 'vitepress-markdown-timeline/dist/theme/index.css';
import 'vitepress-plugin-back-to-top/dist/style.css';
import './styles/index.css';

export default {
  extends: DefaultTheme,

  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'nav-bar-content-after': () => h(NolebaseEnhancedReadabilitiesMenu),
      'nav-screen-content-after': () =>
        h(NolebaseEnhancedReadabilitiesScreenMenu),
    }),

  setup: () => {
    const route = useRoute();
    const initZoom = () =>
      mediumZoom('.main img:not(a *)', { background: 'var(--vp-c-bg)' });
    onMounted(initZoom);
    watch(
      () => route.path,
      () => nextTick(initZoom),
    );

    const { frontmatter } = toRefs(useData());

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
  },

  enhanceApp({ app, router }) {
    vitepressBackToTop({
      threshold: 300,
    });

    app.component('HelpUs', HelpUs);
    app.component('RandomJump', RandomJump);
    app.component('BackToTopTip', BackToTopTip);
    app.component('NolebaseUnlazyImg', NolebaseUnlazyImg);
    app.component('DormitoryIdGenerator', DormitoryIdGenerator);

    app.use(NolebaseGitChangelogPlugin);
    app.use(
      NolebasePagePropertiesPlugin<{
        progress: number;
      }>(),
      {
        properties: locales.pageProperties,
      },
    );

    if (inBrowser) {
      NProgress.configure({ showSpinner: false });
      router.onBeforeRouteChange = () => void NProgress.start();
      router.onAfterRouteChange = () => void NProgress.done();
    }

    enhanceAppWithTabs(app);
  },
} satisfies Theme;
