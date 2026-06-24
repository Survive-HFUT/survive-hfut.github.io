import { defineLoader } from 'vitepress';
import { SidebarItem } from 'vitepress-sidebar/types';
import sidebar from '../sidebar';

export type SidebarLink = { href: string; text: string };
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
          links.push({
            href: item.link.replace('.md', ''),
            text: item.text,
          });
        } else {
          links.push({ href: item.link, text: item.text });
        }
      }

      if (item.items) {
        item.items.forEach(add);
      }
    }

    return links;
  },
});
