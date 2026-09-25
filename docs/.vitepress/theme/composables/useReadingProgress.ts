import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { inBrowser, useData, useRoute } from 'vitepress';
import { data as articleVersions } from '../../data/articleVersions.data.ts';
import {
  extractArticleBlocks,
  findArticleRoot,
  serializableBlocks,
} from '../utils/articleDom.ts';
import { canonicalArticlePath } from '../utils/articlePath.ts';
import {
  getReadingStatus,
  readReadingState,
  READING_STATE_EVENT,
  recordArticleVisit,
  updateArticleReadingState,
} from '../utils/readingStorage.ts';
import type {
  ArticleReadingState,
  ReadingStatus,
} from '../utils/readingTypes.ts';
import {
  deleteArticleSnapshot,
  saveArticleSnapshot,
} from '../utils/snapshotStorage.ts';
import { syncSidebarReadingStatus } from '../utils/sidebarReadingStatus.ts';

const WRITE_THROTTLE = 750;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export function useReadingProgress() {
  const route = useRoute();
  const { page } = useData();
  const ready = ref(false);
  const article = ref<ArticleReadingState>({});
  const restoreNotice = ref('');
  const snapshotSaved = ref<boolean | null>(null);
  const stateSaved = ref<boolean | null>(null);
  const currentPath = computed(() =>
    canonicalArticlePath(page.value.relativePath || route.path),
  );
  const currentVersion = computed(
    () => articleVersions[currentPath.value]?.version ?? '',
  );
  const trackable = computed(() => Boolean(currentVersion.value));
  const status = computed<ReadingStatus>(() =>
    currentVersion.value
      ? getReadingStatus(article.value, currentVersion.value)
      : 'unread',
  );
  const progressPercent = computed(() =>
    Math.round((article.value.scrollProgress ?? 0) * 100),
  );
  const resumeAvailable = computed(
    () =>
      ready.value &&
      trackable.value &&
      status.value !== 'read' &&
      progressPercent.value >= 2,
  );
  let activePath = '';
  let routeRun = 0;
  let scrollTimer: ReturnType<typeof setTimeout> | undefined;
  let userHasScrolled = false;

  function refresh(path = currentPath.value) {
    article.value = { ...(readReadingState().articles[path] ?? {}) };
  }

  function markInteraction(event: Event) {
    if (
      !(event instanceof KeyboardEvent) ||
      [
        'ArrowDown',
        'ArrowUp',
        'PageDown',
        'PageUp',
        'End',
        'Home',
        ' ',
      ].includes(event.key)
    )
      userHasScrolled = true;
  }

  function calculateProgress(): ArticleReadingState | null {
    const root = findArticleRoot();
    if (!root || !activePath) return null;
    const rect = root.getBoundingClientRect();
    const rootTop = window.scrollY + rect.top;
    const rootHeight = Math.max(root.scrollHeight, rect.height);
    const readingLine = window.scrollY + window.innerHeight * 0.6;
    const scrollProgress = clamp(
      (readingLine - rootTop) / Math.max(1, rootHeight),
    );
    const headings = Array.from(
      root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6'),
    ).filter(
      (h) =>
        !h.closest(
          '[data-reading-ignore],.vp-nolebase-page-properties,.vp-nolebase-git-changelog',
        ),
    );
    const headingLine =
      window.scrollY + Math.min(160, window.innerHeight * 0.25);
    let currentHeading: HTMLElement | undefined;
    for (const heading of headings) {
      if (window.scrollY + heading.getBoundingClientRect().top <= headingLine)
        currentHeading = heading;
      else break;
    }
    let headingProgress: number | undefined;
    if (currentHeading) {
      const index = headings.indexOf(currentHeading);
      const top = window.scrollY + currentHeading.getBoundingClientRect().top;
      const next = headings[index + 1];
      const bottom = next
        ? window.scrollY + next.getBoundingClientRect().top
        : rootTop + rootHeight;
      headingProgress = clamp((readingLine - top) / Math.max(1, bottom - top));
    }
    return {
      ...article.value,
      scrollProgress,
      lastHeading: currentHeading?.textContent?.replace(/\s+/g, ' ').trim(),
      lastAnchor: currentHeading?.id ? `#${currentHeading.id}` : undefined,
      headingProgress,
    };
  }

  function persistProgress() {
    if (!userHasScrolled || !trackable.value) return;
    const progress = calculateProgress();
    if (!progress || (progress.scrollProgress ?? 0) < 0.02) return;
    const path = activePath;
    const result = updateArticleReadingState(path, (stored) => ({
      ...stored,
      scrollProgress: progress.scrollProgress,
      lastHeading: progress.lastHeading,
      lastAnchor: progress.lastAnchor,
      headingProgress: progress.headingProgress,
    }));
    stateSaved.value = result.saved;
    if (path === currentPath.value) refresh(path);
  }

  function handleScroll() {
    if (!userHasScrolled || scrollTimer) return;
    scrollTimer = setTimeout(() => {
      scrollTimer = undefined;
      persistProgress();
    }, WRITE_THROTTLE);
  }

  async function initializeRoute() {
    const run = ++routeRun;
    ready.value = false;
    restoreNotice.value = '';
    snapshotSaved.value = null;
    stateSaved.value = null;
    userHasScrolled = false;
    await nextTick();
    await nextFrame();
    if (run !== routeRun) return;
    activePath = currentPath.value;
    if (trackable.value) {
      const result = recordArticleVisit(activePath);
      stateSaved.value = result.saved;
      article.value = { ...(result.state.articles[activePath] ?? {}) };
    } else article.value = {};
    ready.value = true;
    syncSidebarReadingStatus();
  }

  async function markAsRead() {
    if (!trackable.value) return;
    const path = currentPath.value;
    const version = currentVersion.value;
    const blocks = serializableBlocks(extractArticleBlocks());
    const now = Date.now();
    snapshotSaved.value = await saveArticleSnapshot({
      path,
      version,
      savedAt: now,
      blocks,
    });
    const result = updateArticleReadingState(path, (stored) => ({
      ...stored,
      readVersion: version,
      readAt: now,
    }));
    stateSaved.value = result.saved;
    if (path === currentPath.value) refresh(path);
    syncSidebarReadingStatus();
  }

  async function markAsUnread() {
    if (!trackable.value) return;
    const path = currentPath.value;
    await deleteArticleSnapshot(path);
    const result = updateArticleReadingState(path, (stored) => {
      const next = { ...stored };
      delete next.readVersion;
      delete next.readAt;
      return next;
    });
    stateSaved.value = result.saved;
    if (path === currentPath.value) refresh(path);
    syncSidebarReadingStatus();
  }

  function restoreProgress() {
    const root = findArticleRoot();
    if (!root) return;
    const anchor = article.value.lastAnchor?.replace(/^#/, '');
    let heading = anchor ? document.getElementById(anchor) : null;
    if (!(heading instanceof HTMLElement) || !root.contains(heading)) {
      heading =
        Array.from(
          root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6'),
        ).find(
          (item) =>
            item.textContent?.replace(/\s+/g, ' ').trim() ===
            article.value.lastHeading,
        ) ?? null;
    }
    let top: number;
    if (heading) {
      const headings = Array.from(
        root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6'),
      );
      const next = headings[headings.indexOf(heading) + 1];
      const headingTop = window.scrollY + heading.getBoundingClientRect().top;
      const bottom = next
        ? window.scrollY + next.getBoundingClientRect().top
        : window.scrollY + root.getBoundingClientRect().bottom;
      top =
        headingTop +
        (article.value.headingProgress ?? 0) * Math.max(0, bottom - headingTop);
    } else {
      const rect = root.getBoundingClientRect();
      top =
        window.scrollY +
        rect.top +
        (article.value.scrollProgress ?? 0) *
          Math.max(root.scrollHeight, rect.height);
      restoreNotice.value = '未找到原章节，已按全文阅读进度恢复。';
    }
    window.scrollTo({
      top: Math.max(0, top - Math.min(160, window.innerHeight * 0.2)),
      behavior: 'smooth',
    });
  }

  function handleExternalStorage() {
    refresh();
    syncSidebarReadingStatus();
  }

  onMounted(() => {
    if (!inBrowser) return;
    window.addEventListener('wheel', markInteraction, { passive: true });
    window.addEventListener('touchmove', markInteraction, { passive: true });
    window.addEventListener('keydown', markInteraction);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pagehide', persistProgress);
    window.addEventListener('storage', handleExternalStorage);
    window.addEventListener(READING_STATE_EVENT, handleExternalStorage);
    void initializeRoute();
  });
  watch(
    () => route.path,
    () => {
      if (inBrowser) {
        persistProgress();
        void initializeRoute();
      }
    },
    { flush: 'pre' },
  );
  onUnmounted(() => {
    if (!inBrowser) return;
    persistProgress();
    if (scrollTimer) clearTimeout(scrollTimer);
    window.removeEventListener('wheel', markInteraction);
    window.removeEventListener('touchmove', markInteraction);
    window.removeEventListener('keydown', markInteraction);
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('pagehide', persistProgress);
    window.removeEventListener('storage', handleExternalStorage);
    window.removeEventListener(READING_STATE_EVENT, handleExternalStorage);
  });
  return {
    ready,
    trackable,
    currentPath,
    currentVersion,
    article,
    status,
    progressPercent,
    resumeAvailable,
    restoreNotice,
    snapshotSaved,
    stateSaved,
    markAsRead,
    markAsUnread,
    restoreProgress,
  };
}

export type ReadingProgressController = ReturnType<typeof useReadingProgress>;
