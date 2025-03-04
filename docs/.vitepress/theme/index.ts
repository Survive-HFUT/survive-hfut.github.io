import { NolebaseGitChangelogPlugin } from '@nolebase/vitepress-plugin-git-changelog/client';
import { NolebaseUnlazyImg } from '@nolebase/vitepress-plugin-thumbnail-hash/client';
import { type Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';

import '@nolebase/vitepress-plugin-git-changelog/client/style.css';
import '@nolebase/vitepress-plugin-thumbnail-hash/client/style.css';
import 'vitepress-markdown-timeline/dist/theme/index.css';
import './style.css';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {});
  },
  enhanceApp({ app }) {
    app.component('NolebaseUnlazyImg', NolebaseUnlazyImg);
    app.use(NolebaseGitChangelogPlugin);
  },
} satisfies Theme;
