import { align } from '@mdit/plugin-align';
import { figure } from '@mdit/plugin-figure';
import { footnote } from '@mdit/plugin-footnote';
import { katex } from '@mdit/plugin-katex';
import { spoiler } from '@mdit/plugin-spoiler';
import { sup } from '@mdit/plugin-sup';
import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from '@nolebase/vitepress-plugin-git-changelog/vite';
import {
  PageProperties,
  PagePropertiesMarkdownSection,
} from '@nolebase/vitepress-plugin-page-properties/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { DefaultTheme, defineConfig, UserConfig } from 'vitepress';
import timeline from 'vitepress-markdown-timeline';
import {
  chineseSearchOptimize,
  pagefindPlugin,
} from 'vitepress-plugin-pagefind';
import { RssPlugin } from 'vitepress-plugin-rss';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';
import keywords from './data/keywords.json';
import contributors from './helpers/contributors';
import { BiDirectionalLinks } from '@nolebase/markdown-it-bi-directional-links';
import customElements from './helpers/customElements';
import locales from './i18n/locales';
import sidebar, { excludedPages } from './sidebar';

const time =
  new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) +
  ' GMT+8:00';

const excludes = ['index.md', 'random.md'];

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '活在肥宣',
  description: '更适合合工大学生的生活指南',
  head: getHead(),
  cleanUrls: true,
  lastUpdated: true,
  lang: 'zh-CN',

  markdown: {
    ...locales.markdown,
    config: (md) =>
      void md
        .use(spoiler)
        .use(sup)
        .use(figure, { linkImage: false })
        .use(footnote)
        .use(align)
        .use(katex)
        .use(timeline)
        .use(BiDirectionalLinks({ dir: 'docs' }))
        .use(tabsMarkdownPlugin),
    toc: {
      level: [2, 3, 4],
    },
  },

  vite: {
    plugins: [
      GitChangelog({
        repoURL: 'https://github.com/Survive-HFUT/survive-hfut.github.io',
        mapAuthors: contributors,
      }),
      PageProperties(),
      PagePropertiesMarkdownSection({
        excludes: excludes.concat(['ongoing.md']),
      }),
      GitChangelogMarkdownSection({
        excludes,
      }),
      RssPlugin({
        title: '活在肥宣',
        copyright: 'CC-BY-SA 4.0',
        baseUrl: 'https://survive-hfut.cc',
      }),
      pagefindPlugin({
        customSearchQuery: chineseSearchOptimize,
        showDate: true,
        ...locales.search,
        excludeSelector: [
          '.vp-nolebase-page-properties',
          'h2#贡献者',
          '.vp-nolebase-git-changelog',
          'h2#页面历史',
          'vp-nolebase-git-changelog',
        ],
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'book.png', 'hfut.svg'],
        manifest: {
          name: '活在肥宣',
          short_name: '活在肥宣',
          description: '更适合合工大学生的生活指南',
          theme_color: '#3451b2',
          background_color: '#ffffff',
          lang: 'zh-CN',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/book.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/book.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'],
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        },
      }),
    ],

    optimizeDeps: {
      exclude: [
        '@nolebase/vitepress-plugin-enhanced-readabilities/client',
        '@nolebase/ui',
        'vitepress',
      ],
    },
    ssr: {
      noExternal: [
        '@nolebase/vitepress-plugin-enhanced-readabilities',
        '@nolebase/vitepress-plugin-highlight-targeted-heading',
        '@nolebase/ui',
      ],
    },
  },

  vue: {
    template: {
      compilerOptions: {
        isCustomElement: customElements.includes,
      },
    },
  },

  themeConfig: {
    nav: [
      { text: '猜你想问', link: '/enrollment/first_glimpse/qa' },
      { text: '正在发生', link: '/ongoing' },
      { text: '关于', link: '/about' },
      {
        text: '反馈',
        items: [
          {
            text: '交流群',
            link: 'https://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=hnhYa-TdwN9v_2f4wXmayC1V0vcdNUEx&authKey=pZs4xDQrK0eFcl2oKMtHB2E9O%2FqXX8SA%2FNNELsIR9t6kgC0YKqxVTrdl9t%2FpI6nO&noverify=0&group_code=812229258',
          },
          {
            text: '腾讯文档',
            link: 'https://docs.qq.com/form/page/DTmd5anpGbmJHUGd6',
          },
          {
            text: 'GitHub Issue',
            link: 'https://github.com/Survive-HFUT/survive-hfut.github.io/issues/new',
          },
          {
            text: 'GitHub Discussion',
            link: 'https://github.com/orgs/Survive-HFUT/discussions/new?category=%E5%8F%8D%E9%A6%88',
          },
        ],
      },
    ],

    externalLinkIcon: true,

    sidebar,

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/Survive-HFUT/survive-hfut.github.io',
      },
    ],

    // Footer 详见 ./theme/components/Footer.vue

    editLink: {
      pattern:
        'https://github.com/Survive-HFUT/survive-hfut.github.io/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },

    ...locales.main,
  },

  sitemap: {
    hostname: 'https://survive-hfut.cc',
  },

  srcExclude: excludedPages,
});

function getHead() {
  const head: UserConfig<DefaultTheme.Config>['head'] = [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/book.png' }],
    ['meta', { name: 'mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-title', content: '活在肥宣' }],
    [
      'meta',
      {
        name: 'keywords',
        content: keywords.join(','),
      },
    ],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
    ],
    ['meta', { name: 'theme-color', content: '#3451b2' }],
    ['link', { rel: 'manifest', href: '/manifest.webmanifest' }],
    [
      'script',
      {},
      `console.log("%c 活在肥宣 %c Built at ${time}", "font-weight:700;background:#3451b2;color:white;font-size:16px","color:#64748b")`,
    ],
  ];

  if (process.env.NODE_ENV === 'production') {
    head.push([
      'script',
      {
        defer: 'true',
        src: 'https://cloud.umami.is/script.js',
        'data-website-id': 'e4fe9a73-74ca-4c11-99e5-585d60267170',
        // dashboard: https://cloud.umami.is/share/TO6zOo7xWbS2gcFF/survive-hfut.cc
      },
    ]);
  }

  return head;
}
