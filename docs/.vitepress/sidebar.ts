import { existsSync, readFileSync } from 'fs';
import { generateSidebar } from 'vitepress-sidebar';
import type {
  SidebarItem,
  SidebarMulti,
  VitePressSidebarOptions,
} from 'vitepress-sidebar/types';

export const excludedPages: string[] = [];

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

// 后处理侧边栏数据，根据需要折叠或删除链接
function postProcessSidebar(sidebar: SidebarMulti) {
  const walk = (items: SidebarItem[]) => {
    items.forEach((item) => {
      const link = item.link?.replace(/\/?index\.md$/, '/');

      if (item.link && link) {
        item.collapsed = true;

        if (whetherToExcludeLink(item.link)) {
          excludedPages.push(item.link);
          delete item.link;
        }
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
