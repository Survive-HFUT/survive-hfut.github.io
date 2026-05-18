import { defineLoader } from 'vitepress';
import { SidebarItem } from 'vitepress-sidebar/types';
import sidebar from '../sidebar';

export type SidebarLink = [string, string];
export type SidebarData = SidebarLink[];

declare const data: SidebarData;
export { data };

// 导入网站所有链接，用于随机跳转
export default defineLoader({
  load() {
    const links: SidebarLink[] = [];

    sidebar['/'].items.forEach(add);

    function add(item: SidebarItem) {
      if (item.link && item.text) {
        if (item.link.endsWith('.md')) {
          links.push([item.link.replace('.md', ''), item.text]);
        } else {
          links.push([item.link, item.text]);
        }
      }

      if (item.items) {
        item.items.forEach(add);
      }
    }

    return links;
  },
});
