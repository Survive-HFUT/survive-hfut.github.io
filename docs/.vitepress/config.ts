import { UnlazyImages } from '@nolebase/markdown-it-unlazy-img';
import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from '@nolebase/vitepress-plugin-git-changelog/vite';
import { ThumbnailHashImages } from '@nolebase/vitepress-plugin-thumbnail-hash/vite';
import footnote from 'markdown-it-footnote';
import mathjax3 from 'markdown-it-mathjax3';
import taskLists from 'markdown-it-task-checkbox';
import { defineConfig } from 'vitepress';
import timeline from 'vitepress-markdown-timeline';
import { MermaidMarkdown, MermaidPlugin } from 'vitepress-plugin-mermaid';
import { RssPlugin } from 'vitepress-plugin-rss';
import { generateSidebar } from 'vitepress-sidebar';
import customElements from './customElements';
import locales from './locales';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '活在肥宣',
  description: '合工大宣学生手册 · 你的薰化路 301 号指南',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  cleanUrls: true,
  lastUpdated: true,
  lang: 'zh-CN',

  markdown: {
    ...locales.markdown,
    config: (md) => {
      md.use(MermaidMarkdown);

      md.use(UnlazyImages(), {
        imgElementTag: 'NolebaseUnlazyImg',
      });

      md.use(footnote);
      md.renderer.rules.footnote_anchor = function (
        tokens,
        idx,
        options,
        env,
        slf,
      ) {
        let id = slf.rules.footnote_anchor_name?.(
          tokens,
          idx,
          options,
          env,
          slf,
        );
        if (tokens[idx].meta.subId > 0) {
          id += ':' + tokens[idx].meta.subId;
        }
        return ' <a href="#fnref' + id + '" class="footnote-backref">👈🏻</a>';
      };

      md.use(taskLists);
      md.use(timeline);
      md.use(mathjax3);
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
    },
    ssr: {
      noExternal: ['mermaid'],
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
            text: 'GitHub Issue',
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
});
