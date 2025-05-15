import { UnlazyImages } from '@nolebase/markdown-it-unlazy-img';
import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from '@nolebase/vitepress-plugin-git-changelog/vite';
import { ThumbnailHashImages } from '@nolebase/vitepress-plugin-thumbnail-hash/vite';
import { withPwa } from '@vite-pwa/vitepress';
import footnote from 'markdown-it-footnote';
import mathjax3 from 'markdown-it-mathjax3';
import sup from 'markdown-it-sup';
import taskLists from 'markdown-it-task-checkbox';
import { defineConfig } from 'vitepress';
import timeline from 'vitepress-markdown-timeline';
import { MermaidMarkdown, MermaidPlugin } from 'vitepress-plugin-mermaid';
import { RssPlugin } from 'vitepress-plugin-rss';
import { generateSidebar } from 'vitepress-sidebar';
import customElements from './customElements';
import locales from './locales';

// https://vitepress.dev/reference/site-config
export default withPwa(
  defineConfig({
    title: '活在肥宣',
    description: '合工大宣生活手册 · 你的薰化路 301 号指南',
    head: [
      ['link', { rel: 'icon', href: '/favicon.ico' }],
      ['link', { rel: 'apple-touch-icon', href: '/book.png' }],
      ['meta', { name: 'mobile-web-app-capable', content: 'yes' }],
      ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
      ['meta', { name: 'apple-mobile-web-app-title', content: '活在肥宣' }],
      [
        'meta',
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
      ],
    ],
    cleanUrls: true,
    lastUpdated: true,
    lang: 'zh-CN',

    markdown: {
      ...locales.markdown,
      config: (md) => {
        md.use(sup);
        md.use(footnote);
        md.use(taskLists);
        md.use(mathjax3);
        md.use(timeline);
        md.use(MermaidMarkdown);

        md.use(UnlazyImages(), {
          imgElementTag: 'NolebaseUnlazyImg',
        });
      },
    },

    vite: {
      plugins: [
        ThumbnailHashImages(),
        GitChangelog({
          repoURL: 'https://github.com/Survive-HFUT/survive-hfut.github.io',
        }),
        GitChangelogMarkdownSection(),
        MermaidPlugin(),
        RssPlugin({
          title: '活在肥宣',
          copyright: 'CC-BY-SA 4.0',
          baseUrl: 'https://survive-hfut.cc',
        }),
      ] as Plugin[],

      optimizeDeps: {
        include: ['mermaid'],
        exclude: [
          '@nolebase/vitepress-plugin-enhanced-readabilities/client',
          '@nolebase/ui',
          'vitepress',
        ],
      },
      ssr: {
        noExternal: [
          '@nolebase/vitepress-plugin-enhanced-readabilities',
          '@nolebase/ui',
          'mermaid',
        ],
      },
    },

    vue: {
      template: {
        transformAssetUrls: {
          NolebaseUnlazyImg: ['src'],
        },
        compilerOptions: {
          isCustomElement: (tag) => customElements.includes(tag),
        },
      },
    },

    themeConfig: {
      nav: [
        { text: '黄页', link: '/contact' },
        { text: '关于', link: '/about' },
        {
          text: '反馈',
          items: [
            {
              text: '腾讯文档',
              link: 'https://docs.qq.com/form/page/DTmd5anpGbmJHUGd6',
            },
            {
              text: 'GitHub Issue（推荐）',
              link: 'https://github.com/Survive-HFUT/survive-hfut.github.io/issues/new',
            },
          ],
        },
      ],

      externalLinkIcon: true,

      sidebar: generateSidebar([
        {
          useFolderLinkFromIndexFile: true,
          useTitleFromFileHeading: true,
          useFolderTitleFromIndexFile: true,
          documentRootPath: '/docs',
          collapsed: false,
          collapseDepth: 2,
          resolvePath: '/',
          manualSortFileNameByPriority: ['intro.md'],
          sortMenusByFrontmatterOrder: true,
          frontmatterOrderDefaultValue: 100,
        },
      ]),

      socialLinks: [
        {
          icon: 'github',
          link: 'https://github.com/Survive-HFUT/survive-hfut.github.io',
        },
      ],

      search: {
        provider: 'local',
        options: {
          translations: locales.search,
        },
      },

      footer: {
        message: 'Built with VitePress.',
        copyright: '未做特别声明的内容，均按照 CC-BY-SA 4.0 协议进行分发',
      },

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

    pwa: {
      outDir: '.vitepress/dist',
      registerType: 'autoUpdate',
      base: '/',
      scope: '/',
      includeAssets: ['book.png'],
      includeManifestIcons: false,
      manifest: {
        id: '/',
        name: '活在肥宣',
        short_name: '活在肥宣',
        description: '合工大宣生活手册 · 你的薰化路 301 号指南',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/book.png',
            sizes: '1024x1024',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{css,js,html,svg,jpg,png,ico,txt,woff2}'],
        maximumFileSizeToCacheInBytes: 7 * 1024 * 1024,
      },
      experimental: {
        includeAllowlist: true,
      },
      devOptions: {
        enabled: true,
        navigateFallback: '/',
      },
    },
  }),
);
