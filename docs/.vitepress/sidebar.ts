import { generateSidebar } from 'vitepress-sidebar';
import { type SidebarItem, type SidebarMulti } from 'vitepress-sidebar/types';

// 需要折叠的文件夹链接
const shouldCollapse = ['more/', 'organizations/','city/'];

// 需要删除链接但保留在侧边栏中的文件夹链接（即保留其子项，但不让该文件夹本身成为一个可点击的链接）
const shouldDeleteLink = [
  'enrollment/',
  'study/',
  'life/',
  'more/',
  'city/',
  'life/sports_fitness/',
  'life/transportation/',
  'study/first/',
];

// 后处理侧边栏数据，根据需要折叠或删除链接
function postProcessSidebar(sidebar: SidebarMulti) {
  const walk = (items: SidebarItem[]) => {
    items.forEach((item) => {
      const link = item.link?.replace(/\/?index\.md$/, '/');

      if (link) {
        if (shouldCollapse.includes(link)) {
          item.collapsed = true;
        }

        if (shouldDeleteLink.includes(link)) {
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

export default postProcessSidebar(
  generateSidebar([
    {
      useTitleFromFileHeading: true,
      useFolderLinkFromIndexFile: true,
      useFolderTitleFromIndexFile: true,
      useTitleFromFrontmatter: true,

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
