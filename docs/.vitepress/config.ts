import { UnlazyImages } from '@nolebase/markdown-it-unlazy-img';
import { type Author } from '@nolebase/vitepress-plugin-git-changelog';
import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from '@nolebase/vitepress-plugin-git-changelog/vite';
import {
  PageProperties,
  PagePropertiesMarkdownSection,
} from '@nolebase/vitepress-plugin-page-properties/vite';
import { ThumbnailHashImages } from '@nolebase/vitepress-plugin-thumbnail-hash/vite';
import footnote from 'markdown-it-footnote';
import mathjax3 from 'markdown-it-mathjax3';
import sup from 'markdown-it-sup';
import { Octokit } from 'octokit';
import { defineConfig } from 'vitepress';
import timeline from 'vitepress-markdown-timeline';
import { MermaidMarkdown, MermaidPlugin } from 'vitepress-plugin-mermaid';
import { RssPlugin } from 'vitepress-plugin-rss';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';
import customElements from './customElements';
import locales from './locales';
import { sidebarValue } from './sidebar.data';

const time =
  new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) +
  ' GMT+8:00';

// https://vitepress.dev/reference/site-config
export default defineConfig({
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
    [
      'script',
      {
        defer: 'true',
        src: 'https://cloud.umami.is/script.js',
        'data-website-id': 'e4fe9a73-74ca-4c11-99e5-585d60267170',
        // dashboard: https://cloud.umami.is/share/TO6zOo7xWbS2gcFF/survive-hfut.cc
      },
    ],
    ['script', {}, `console.log("Built at ${time}")`],
  ],
  cleanUrls: true,
  lastUpdated: true,
  lang: 'zh-CN',

  markdown: {
    ...locales.markdown,
    config: (md) =>
      md
        .use(sup)
        .use(footnote)
        .use(mathjax3)
        .use(timeline)
        .use(UnlazyImages(), {
          imgElementTag: 'NolebaseUnlazyImg',
        })
        .use(MermaidMarkdown)
        .use(tabsMarkdownPlugin),
    toc: {
      level: [2, 3, 4],
    },
  },

  vite: {
    plugins: [
      ThumbnailHashImages(),
      GitChangelog({
        repoURL: 'https://github.com/Survive-HFUT/survive-hfut.github.io',
        mapAuthors: await getAuthors(),
      }),
      GitChangelogMarkdownSection({ excludes: ['_random.md', 'index.md'] }),
      PageProperties(),
      PagePropertiesMarkdownSection(),
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
        isCustomElement: customElements.includes,
      },
    },
  },

  themeConfig: {
    nav: [
      { text: '猜你想问', link: '/enrollment/qa' },
      { text: '随机页面', link: '/_random' },
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

    sidebar: sidebarValue,

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
      message: '使用 VitePress 构建<br/>' + '最后更新：' + time,
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
});

async function getAuthors(): Promise<Author[]> {
  return (
    await new Octokit().rest.repos.listContributors({
      repo: 'survive-hfut.github.io',
      owner: 'Survive-HFUT',
    })
  ).data.map((author) => ({
    name: author.login,
    links: author.html_url,
    avatar: author.avatar_url,
    mapByNameAliases: author.login
      ? [
          author.login,
          author.login.toLowerCase(),
          author.login.replace(/^[a-z]/, (c) => c.toUpperCase()),
        ]
      : [],
    mapByEmailAliases:
      author.id && author.login
        ? [`${author.id}+${author.login}@users.noreply.github.com`]
        : [],
  }));
}
