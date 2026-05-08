import { align } from '@mdit/plugin-align';
import { figure } from '@mdit/plugin-figure';
import { footnote } from '@mdit/plugin-footnote';
import { katex } from '@mdit/plugin-katex';
import { spoiler } from '@mdit/plugin-spoiler';
import { sup } from '@mdit/plugin-sup';
import { type Author } from '@nolebase/vitepress-plugin-git-changelog';
import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from '@nolebase/vitepress-plugin-git-changelog/vite';
import {
  PageProperties,
  PagePropertiesMarkdownSection,
} from '@nolebase/vitepress-plugin-page-properties/vite';
import { DefaultTheme, defineConfig, UserConfig } from 'vitepress';
import timeline from 'vitepress-markdown-timeline';
import { vitepressPluginLegend } from 'vitepress-plugin-legend';
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
        .use(tabsMarkdownPlugin)
        .use(vitepressPluginLegend, {
          mermaid: {
            showToolbar: true,
          },
        }),
    toc: {
      level: [2, 3, 4],
    },
  },

  vite: {
    plugins: [
      GitChangelog({
        repoURL: 'https://github.com/Survive-HFUT/survive-hfut.github.io',
        mapAuthors: await getAuthors(),
      }),
      GitChangelogMarkdownSection({ excludes: ['_random.md', 'index.md'] }),
      PageProperties(),
      PagePropertiesMarkdownSection(),
      RssPlugin({
        title: '活在肥宣',
        copyright: 'CC-BY-SA 4.0',
        baseUrl: 'https://survive-hfut.cc',
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
      { text: '猜你想问', link: '/enrollment/qa' },
      { text: '随便看看', link: '/_random' },
      {
        text: '关于',
        items: [
          { text: '关于本站', link: '/about/' },
          { text: '最近更新', link: '/about/updates' },
          { text: '参与贡献', link: '/about/contribute' },
          { text: 'TODO', link: '/about/todo' },
        ],
      },
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
      copyright: '未作特别声明的内容，均按照 CC-BY-SA 4.0 协议进行分发',
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
  const url =
    'https://api.github.com/repos/Survive-HFUT/survive-hfut.github.io/contributors';
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'survive-hfut-config-script',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as any[];

    return data.map((author) => ({
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
  } catch (error) {
    return [];
  }
}

function getHead() {
  const head: UserConfig<DefaultTheme.Config>['head'] = [
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
      {},
      `console.log("%c 活在肥宣 %c Built at ${time}", "font-weight:700;background:#3451b2;color:white;font-size:16px","color:#64748b")`,
    ],
  ];

  if (process.env.NODE_ENV === 'production') {
    head.push([
      'script',
      {
        async: 'true',
        src: 'https://cloud.umami.is/script.js',
        'data-website-id': 'e4fe9a73-74ca-4c11-99e5-585d60267170',
        // dashboard: https://cloud.umami.is/share/TO6zOo7xWbS2gcFF/survive-hfut.cc
      },
    ]);
  }

  return head;
}
