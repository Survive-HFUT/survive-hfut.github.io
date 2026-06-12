import { NolebaseGitChangelogPlugin } from '@nolebase/vitepress-plugin-git-changelog/client';
import { NolebasePagePropertiesPlugin } from '@nolebase/vitepress-plugin-page-properties';
import { NProgress } from 'nprogress-v2/dist/index.js';
import { inBrowser, type Theme } from 'vitepress';
import vitepressBackToTop from 'vitepress-plugin-back-to-top';
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client';
import DefaultTheme from 'vitepress/theme';
import locales from '../i18n/locales';
import BackToTopTip from './components/BackToTopTip.vue';
import DeeplinkBtn from './components/DeeplinkBtn.vue';
import Note from './components/Note.vue';
import ToDo from './components/ToDo.vue';
import Layout from './Layout.vue';

export default {
  extends: DefaultTheme,

  Layout,

  enhanceApp({ app, router }) {
    vitepressBackToTop({
      threshold: 300,
    });

    app.component('Note', Note);
    app.component('ToDo', ToDo);
    app.component('BackToTopTip', BackToTopTip);
    app.component('DeeplinkBtn', DeeplinkBtn);

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

      const scrollActiveSidebarItem = () => {
        const sidebar = document.querySelector('aside.VPSidebar');
        const activeItem = sidebar?.querySelector(
          'div.VPSidebarItem.is-link.is-active',
        );

        if (!activeItem) {
          return;
        }

        activeItem.scrollIntoView({ block: 'center' });

        if (activeItem instanceof HTMLElement) {
          activeItem.setAttribute('tabindex', '-1');
        }
      };

      const scheduleScrollActiveSidebarItem = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(scrollActiveSidebarItem);
        });
      };

      router.onBeforeRouteChange = () => void NProgress.start();
      router.onAfterRouteChange = () => {
        NProgress.done();
        scheduleScrollActiveSidebarItem();
      };
    }

    enhanceAppWithTabs(app);
  },
} satisfies Theme;
