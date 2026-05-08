import { SidebarItem } from 'vitepress-sidebar/types';
import sidebar from '../sidebar';

// 导入网站所有链接，用于随机跳转
export default {
  load() {
    const links: [string, string][] = [];

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
};
