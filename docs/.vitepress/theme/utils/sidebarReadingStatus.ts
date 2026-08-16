import { data as articleVersions } from '../../data/articleVersions.data.ts';
import {
  getReadingStatus,
  normalizeReadingPath,
  readReadingState,
} from './readingStorage.ts';

const LABELS = {
  reading: '继续',
  read: '✓',
  updated: '更新',
} as const;

export function syncSidebarReadingStatus(): void {
  if (typeof document === 'undefined') return;
  const state = readReadingState();

  document
    .querySelectorAll<HTMLElement>('[data-reading-path]')
    .forEach((marker) => {
      const path = normalizeReadingPath(marker.dataset.readingPath ?? '');
      const version = articleVersions[path]?.version;
      if (!version) {
        marker.textContent = '';
        delete marker.dataset.status;
        delete marker.dataset.last;
        return;
      }

      const status = getReadingStatus(state.articles[path], version);
      const isLast = state.lastVisited === path;
      const label = status === 'unread' ? '' : LABELS[status];
      marker.textContent = [label, isLast ? '←' : ''].filter(Boolean).join(' ');
      marker.dataset.status = status;
      if (isLast) marker.dataset.last = 'true';
      else delete marker.dataset.last;

      const descriptions = [
        status === 'reading'
          ? '阅读中'
          : status === 'read'
            ? '已读'
            : status === 'updated'
              ? '有更新'
              : '',
        isLast ? '上次阅读' : '',
      ].filter(Boolean);
      marker.title = descriptions.join('，');
    });
}
