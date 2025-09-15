import { generateSidebar } from 'vitepress-sidebar';
import { SidebarItem, SidebarMulti } from 'vitepress-sidebar/types';

export const sidebarValue = generateSidebar([
  {
    useFolderLinkFromIndexFile: true,
    useTitleFromFileHeading: true,
    useFolderTitleFromIndexFile: true,
    documentRootPath: '/docs',
    collapsed: false,
    collapseDepth: 2,
    resolvePath: '/',
    manualSortFileNameByPriority: ['intro.md', 'qa.md'],
    sortMenusByFrontmatterOrder: true,
    frontmatterOrderDefaultValue: 100,
    excludeFilesByFrontmatterFieldName: 'exclude',
    excludePattern: ['about/**', 'achievements/**'],
  },
  {
    documentRootPath: 'docs',
    scanStartPath: 'about',
    resolvePath: '/about/',
    useTitleFromFrontmatter: true,
    useFolderLinkFromIndexFile: true,
    useTitleFromFileHeading: true,
    useFolderTitleFromIndexFile: true,
  },
  {
    documentRootPath: 'docs',
    scanStartPath: 'achievements',
    resolvePath: '/achievements/',
    useTitleFromFrontmatter: true,
    useFolderLinkFromIndexFile: true,
    useTitleFromFileHeading: true,
    useFolderTitleFromIndexFile: true,
  },
]);

export default {
  load() {
    const links: string[] = [];

    const sidebar = sidebarValue as SidebarMulti;
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
