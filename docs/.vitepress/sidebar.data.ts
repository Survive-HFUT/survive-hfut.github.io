import { generateSidebar } from 'vitepress-sidebar';
import { SidebarItem, SidebarMulti } from 'vitepress-sidebar/types';

export const sidebarValue = postProcessSidebar(
  generateSidebar([
    {
      useTitleFromFileHeading: true,
      useFolderLinkFromIndexFile: true,
      useFolderTitleFromIndexFile: true,

      documentRootPath: '/docs',
      resolvePath: '/',
      excludeFilesByFrontmatterFieldName: 'exclude',
      excludePattern: ['about/**', 'achievements/**'],

      collapsed: false,
      collapseDepth: 2,

      manualSortFileNameByPriority: ['intro.md', 'qa.md'],
      sortMenusByFrontmatterOrder: true,
      frontmatterOrderDefaultValue: 100,
    },
    {
      documentRootPath: 'docs',
      scanStartPath: 'about',
      resolvePath: '/about/',

      useTitleFromFrontmatter: true,
      useTitleFromFileHeading: true,
      useFolderTitleFromIndexFile: true,

      manualSortFileNameByPriority: ['copyright.md'],

      rootGroupText: '关于',
      rootGroupLink: '/',
    },
    {
      documentRootPath: 'docs',
      scanStartPath: 'achievements',
      resolvePath: '/achievements/',
      useTitleFromFileHeading: true,
    },
  ]) as SidebarMulti,
);

// 后处理侧边栏数据，删除一些文件夹链接
function postProcessSidebar(sidebar: SidebarMulti) {
  sidebar['/'].items.forEach((item) => {
    if (item.link === 'more/index.md') {
      item.collapsed = true;
    }

    if (item.link === 'life/index.md' && item.items) {
      item.items.forEach((subItem) => {
        if (subItem.link === 'life/transportation/index.md') {
          delete subItem.link;
        }
      });
    }

    if (item.link === 'study/index.md' && item.items) {
      item.items.forEach((subItem) => {
        if (subItem.link === 'study/first/index.md') {
          delete subItem.link;
        }
      });
    }

    if (
      item.link === 'enrollment/index.md' ||
      item.link === 'study/index.md' ||
      item.link === 'life/index.md' ||
      item.link === 'more/index.md' ||
      item.link === 'city/index.md'
    ) {
      delete item.link;
    }
  });

  return sidebar;
}

// 导入网站所有链接，用于随机跳转
export default {
  load() {
    const links: string[] = [];

    const sidebar = sidebarValue;
    sidebar['/'].items.forEach(add);

    function add(item: SidebarItem) {
      if (item.link) {
        if (item.link.endsWith('.md')) {
          links.push(item.link.replace('.md', ''));
        } else {
          links.push(item.link);
        }
      }

      if (item.items) {
        item.items.forEach(add);
      }
    }

    return links;
  },
};
