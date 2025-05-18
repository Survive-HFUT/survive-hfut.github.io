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
  },
]);

export default {
  load() {
    const links: string[] = [];

    const sidebar = sidebarValue as SidebarMulti;
    for (const [_, { items }] of Object.entries(sidebar)) {
      items.forEach(add);
    }

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
