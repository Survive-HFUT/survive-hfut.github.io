import { existsSync, readFileSync } from 'fs';
import { generateSidebar } from 'vitepress-sidebar';
import type {
  SidebarItem,
  SidebarMulti,
  VitePressSidebarOptions,
} from 'vitepress-sidebar/types';

export const excludedPages: string[] = [];

// 需要折叠的文件夹链接
const shouldCollapse = ['more/', 'organizations/', 'city/'];

function whetherToExcludeLink(path?: string): boolean {
  if (path && path != '/' && existsSync(`docs/${path}`)) {
    const content = readFileSync(`docs/${path}`, 'utf-8');

    // 检查是否显式排除了该链接
    if (content.includes('exclude: true')) {
      return true;
    }

    // 检查文件是否有正文内容（仅有 front matter 或 markdown 标题视为无正文）
    let body = content;

    // 移除 front matter（--- ... ---）
    body = body.replace(/^---[\s\S]*?---\r?\n?/, '');

    // 移除 markdown 标题行（# 标题）
    body = body.replace(/^#{1,6}\s+.*$/gm, '');

    // 移除空行和仅空白字符的行
    body = body.replace(/^\s*$/gm, '');

    // 如果没有剩余内容，视为无正文
    return body.trim().length === 0;
  }

  return false;
}

// 校区代号 → 中文标签
const cityLabel: Record<string, string> = { xc: '宣城', hf: '合肥' };

// 从 item.link 对应文件的 frontmatter 读取 city 字段
// item.link 是 clean URL：叶子文章 foo.md 或目录索引 foo/index.md，都要试
function readCityFromLink(link?: string): string | undefined {
  if (!link) return undefined;
  const rel = link.replace(/^\//, '').replace(/\/$/, '');
  const file = (
    rel.endsWith('.md') ? [`docs/${rel}`] : [`docs/${rel}.md`, `docs/${rel}/index.md`]
  ).find((p) => existsSync(p));
  if (!file) return undefined;
  const fm = readFileSync(file, 'utf-8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  return fm?.match(/^city:\s*(\S+)/m)?.[1];
}

// 后处理侧边栏数据，根据需要折叠或删除链接
function postProcessSidebar(sidebar: SidebarMulti) {
  const walk = (items: SidebarItem[]) => {
    items.forEach((item) => {
      const link = item.link?.replace(/\/?index\.md$/, '/');

      // 读取 frontmatter 中的 city 字段，用于在侧边栏渲染校区标签
      const city = readCityFromLink(item.link);

      if (item.link && link) {
        if (shouldCollapse.includes(link)) {
          item.collapsed = true;
        }

        if (whetherToExcludeLink(item.link)) {
          excludedPages.push(item.link);
          delete item.link;
        }
      }

      // 将校区徽标追加到条目文本：复用 VitePress 原生 <Badge> 的 .VPBadge 类，
      // VPSidebarItem 用 v-html 渲染 text，故直接写 Badge 组件产出的 HTML 结构。
      // 保留 data-city 供 campusSwitch.css 做校区过滤。
      if (city && item.text) {
        item.text += `<span class="VPBadge tip" data-city="${city}">${cityLabel[city] ?? city}</span>`;
      }

      if (item.items?.length) {
        walk(item.items);
      }
    });
  };

  Object.values(sidebar).forEach((group) => {
    if (group.items?.length) {
      walk(group.items);
    }
  });

  return sidebar;
}

const defaultSidebar: VitePressSidebarOptions = {
  useTitleFromFileHeading: true,
  useFolderLinkFromIndexFile: true,
  useFolderTitleFromIndexFile: true,
  useTitleFromFrontmatter: true,
  sortMenusByFrontmatterOrder: true,
  frontmatterOrderDefaultValue: 100,
};

export default postProcessSidebar(
  generateSidebar(
    (
      [
        {
          documentRootPath: '/docs',
          resolvePath: '/',
          excludeFilesByFrontmatterFieldName: 'exclude',
          excludeByGlobPattern: ['about/**', 'achievements/**'],
          collapsed: false,
          collapseDepth: 2,
          manualSortFileNameByPriority: ['intro.md', 'qa.md'],
        },
        {
          documentRootPath: 'docs',
          scanStartPath: 'about',
          resolvePath: '/about/',
          manualSortFileNameByPriority: ['copyright.md'],
          rootGroupText: '❤️ 关于',
          rootGroupLink: '/',
        },
        {
          documentRootPath: 'docs',
          scanStartPath: 'achievements',
          resolvePath: '/achievements/',
        },
      ] satisfies VitePressSidebarOptions[]
    ).map((item) => ({ ...defaultSidebar, ...item })),
  ) as SidebarMulti,
);
