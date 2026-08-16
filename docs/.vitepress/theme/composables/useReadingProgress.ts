import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { inBrowser, useData, useRoute } from 'vitepress';
import { data as articleVersions } from '../../data/articleVersions.data.ts';
import {
  clearArticleChangePresentation,
  extractArticleBlocks,
  findArticleRoot,
  renderArticleChanges,
  scrollToFirstChange,
  serializableBlocks,
  setUpdateOnlyMode,
  type DomArticleBlock,
} from '../utils/articleDom.ts';
import {
  diffArticleBlocks,
  summarizeChanges,
  textSimilarity,
} from '../utils/articleDiff.ts';
import {
  getReadingStatus,
  normalizeReadingPath,
  readReadingState,
  READING_STATE_EVENT,
  recordArticleVisit,
  updateArticleReadingState,
} from '../utils/readingStorage.ts';
import type {
  ArticleChange,
  ArticleReadingState,
  ReadingStatus,
} from '../utils/readingTypes.ts';
import {
  deleteArticleSnapshot,
  readArticleSnapshot,
  saveArticleSnapshot,
} from '../utils/snapshotStorage.ts';
import { syncSidebarReadingStatus } from '../utils/sidebarReadingStatus.ts';

const WRITE_THROTTLE = 750;

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function scrollKeys(event: KeyboardEvent): boolean {
  return [
    'ArrowDown',
    'ArrowUp',
    'PageDown',
    'PageUp',
    'End',
    'Home',
    ' ',
  ].includes(event.key);
}

export function useReadingProgress() {
  const route = useRoute();
  const { page } = useData();
  const ready = ref(false);
  const article = ref<ArticleReadingState>({});
  const changes = ref<ArticleChange[]>([]);
  const diffLoading = ref(false);
  const diffUnavailable = ref<'storage' | 'missing' | null>(null);
  const updateOnly = ref(false);
  const restoreNotice = ref('');
  const snapshotSaved = ref<boolean | null>(null);
  const currentPath = computed(() => {
    const relativePath = page.value.relativePath;
    if (!relativePath || relativePath === 'index.md') return '/';
    return normalizeReadingPath(`/${relativePath.replace(/\.md$/, '')}`);
  });
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
  const changeSummary = computed(() => summarizeChanges(changes.value));
  const changedSections = computed(() => {
    const sections = new Map<string, string | undefined>();
    for (const change of changes.value) {
      if (change.section) sections.set(change.section, change.anchor);
    }
    return Array.from(sections, ([title, anchor]) => ({ title, anchor }));
  });

  let blocks: DomArticleBlock[] = [];
  let activePath = '';
  let routeRun = 0;
  let scrollTimer: ReturnType<typeof setTimeout> | undefined;
  let userHasScrolled = false;

  function refreshArticleFromStorage(): void {
    article.value = {
      ...(readReadingState().articles[currentPath.value] ?? {}),
    };
  }

  function markScrollInteraction(event: Event): void {
    if (!(event instanceof KeyboardEvent) || scrollKeys(event)) {
      userHasScrolled = true;
    }
  }

  function calculateProgress(): ArticleReadingState | null {
    const root = findArticleRoot();
    if (!root || !activePath) return null;
    const rect = root.getBoundingClientRect();
    const rootTop = window.scrollY + rect.top;
    const rootHeight = Math.max(root.scrollHeight, rect.height);
    const readingLine = window.scrollY + window.innerHeight * 0.6;
    const scrollProgress = clamp((readingLine - rootTop) / rootHeight);
    const headings = blocks.filter(
      (block) => block.type === 'heading' && block.element.isConnected,
    );
    const headingLine =
      window.scrollY + Math.min(160, window.innerHeight * 0.25);
    let currentHeading = headings[0];

    for (const heading of headings) {
      const top = window.scrollY + heading.element.getBoundingClientRect().top;
      if (top <= headingLine) currentHeading = heading;
      else break;
    }

    let headingProgress: number | undefined;
    if (currentHeading) {
      const headingIndex = headings.indexOf(currentHeading);
      const top =
        window.scrollY + currentHeading.element.getBoundingClientRect().top;
      const nextHeading = headings[headingIndex + 1];
      const bottom = nextHeading
        ? window.scrollY + nextHeading.element.getBoundingClientRect().top
        : rootTop + rootHeight;
      headingProgress = clamp((readingLine - top) / Math.max(1, bottom - top));
    }

    return {
      ...article.value,
      scrollProgress,
      lastHeading: currentHeading?.text,
      lastAnchor: currentHeading?.element.id
        ? `#${currentHeading.element.id}`
        : undefined,
      headingProgress,
    };
  }

  function persistProgress(): void {
    if (!userHasScrolled || !trackable.value) return;
    const progress = calculateProgress();
    if (!progress || (progress.scrollProgress ?? 0) < 0.02) return;
    const path = activePath;
    updateArticleReadingState(path, (stored) => ({
      ...stored,
      scrollProgress: progress.scrollProgress,
      lastHeading: progress.lastHeading,
      lastAnchor: progress.lastAnchor,
      headingProgress: progress.headingProgress,
    }));
    if (path === currentPath.value) refreshArticleFromStorage();
  }

  function handleScroll(): void {
    if (!userHasScrolled || scrollTimer) return;
    scrollTimer = setTimeout(() => {
      scrollTimer = undefined;
      persistProgress();
    }, WRITE_THROTTLE);
  }

  async function refreshDiff(run = routeRun): Promise<void> {
    changes.value = [];
    diffUnavailable.value = null;
    if (status.value !== 'updated') return;
    diffLoading.value = true;
    const path = currentPath.value;
    const result = await readArticleSnapshot(path);
    if (run !== routeRun || path !== currentPath.value) return;

    diffLoading.value = false;
    if (!result.available) {
      diffUnavailable.value = 'storage';
      return;
    }
    if (
      !result.snapshot ||
      result.snapshot.version !== article.value.readVersion
    ) {
      diffUnavailable.value = 'missing';
      return;
    }

    blocks = extractArticleBlocks();
    changes.value = diffArticleBlocks(
      result.snapshot.blocks,
      serializableBlocks(blocks),
    );
    const root = findArticleRoot();
    if (root) renderArticleChanges(root, blocks, changes.value);
  }

  async function initializeRoute(): Promise<void> {
    const run = ++routeRun;
    ready.value = false;
    changes.value = [];
    diffUnavailable.value = null;
    updateOnly.value = false;
    restoreNotice.value = '';
    snapshotSaved.value = null;
    userHasScrolled = false;
    clearArticleChangePresentation();
    await nextTick();
    await nextFrame();
    if (run !== routeRun) return;

    activePath = currentPath.value;
    blocks = trackable.value ? extractArticleBlocks() : [];
    if (trackable.value) {
      const state = recordArticleVisit(activePath);
      article.value = { ...(state.articles[activePath] ?? {}) };
    } else {
      article.value = {};
    }
    ready.value = true;
    syncSidebarReadingStatus();
    await refreshDiff(run);
  }

  async function markAsRead(): Promise<void> {
    if (!trackable.value) return;
    blocks = extractArticleBlocks();
    const path = currentPath.value;
    const now = Date.now();
    snapshotSaved.value = await saveArticleSnapshot({
      path,
      version: currentVersion.value,
      savedAt: now,
      blocks: serializableBlocks(blocks),
    });
    updateArticleReadingState(path, (stored) => ({
      ...stored,
      readVersion: currentVersion.value,
      readAt: now,
    }));
    refreshArticleFromStorage();
    changes.value = [];
    diffUnavailable.value = null;
    updateOnly.value = false;
    clearArticleChangePresentation();
    syncSidebarReadingStatus();
  }

  async function markAsUnread(): Promise<void> {
    if (!trackable.value) return;
    const path = currentPath.value;
    await deleteArticleSnapshot(path);
    updateArticleReadingState(path, (stored) => {
      const next = { ...stored };
      delete next.readVersion;
      delete next.readAt;
      return next;
    });
    refreshArticleFromStorage();
    changes.value = [];
    diffUnavailable.value = null;
    updateOnly.value = false;
    clearArticleChangePresentation();
    syncSidebarReadingStatus();
  }

  function findResumeHeading(root: HTMLElement): HTMLElement | null {
    const anchor = article.value.lastAnchor?.replace(/^#/, '');
    if (anchor) {
      const exact = document.getElementById(anchor);
      if (exact instanceof HTMLElement && root.contains(exact)) return exact;
    }

    const headings = Array.from(
      root.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6'),
    ).filter((heading) => !heading.closest('[data-reading-ignore]'));
    const title = article.value.lastHeading;
    if (!title) return null;
    const exactTitle = headings.find(
      (heading) => heading.textContent?.replace(/\s+/g, ' ').trim() === title,
    );
    if (exactTitle) return exactTitle;

    let best: { heading: HTMLElement; score: number } | undefined;
    for (const heading of headings) {
      const score = textSimilarity(title, heading.textContent ?? '');
      if (!best || score > best.score) best = { heading, score };
    }
    return best && best.score >= 0.45 ? best.heading : null;
  }

  function restoreProgress(): void {
    const root = findArticleRoot();
    if (!root) return;
    const heading = findResumeHeading(root);
    let top: number;

    if (heading) {
      const headings = Array.from(
        root.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6'),
      );
      const index = headings.indexOf(heading);
      const next = headings[index + 1];
      const headingTop = window.scrollY + heading.getBoundingClientRect().top;
      const sectionBottom = next
        ? window.scrollY + next.getBoundingClientRect().top
        : window.scrollY + root.getBoundingClientRect().bottom;
      top =
        headingTop +
        (article.value.headingProgress ?? 0) *
          Math.max(0, sectionBottom - headingTop);
      const usedFallback =
        Boolean(article.value.lastAnchor) &&
        heading.id !== article.value.lastAnchor?.replace(/^#/, '');
      restoreNotice.value = usedFallback
        ? '文章结构已有变化，已恢复到最接近的章节位置。'
        : '';
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

  function toggleUpdateOnly(): void {
    const root = findArticleRoot();
    if (!root) return;
    updateOnly.value = !updateOnly.value;
    setUpdateOnlyMode(root, blocks, changes.value, updateOnly.value);
  }

  function showAllUpdates(): void {
    const root = findArticleRoot();
    if (!root) return;
    if (updateOnly.value) {
      updateOnly.value = false;
      setUpdateOnlyMode(root, blocks, changes.value, false);
    }
    scrollToFirstChange(root);
  }

  function jumpToSection(anchor?: string): void {
    if (!anchor) return;
    document
      .getElementById(anchor)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleExternalStorage(): void {
    refreshArticleFromStorage();
    syncSidebarReadingStatus();
  }

  onMounted(() => {
    if (!inBrowser) return;
    window.addEventListener('wheel', markScrollInteraction, { passive: true });
    window.addEventListener('touchmove', markScrollInteraction, {
      passive: true,
    });
    window.addEventListener('keydown', markScrollInteraction);
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
    clearArticleChangePresentation();
    window.removeEventListener('wheel', markScrollInteraction);
    window.removeEventListener('touchmove', markScrollInteraction);
    window.removeEventListener('keydown', markScrollInteraction);
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
    changes,
    changeSummary,
    changedSections,
    diffLoading,
    diffUnavailable,
    updateOnly,
    restoreNotice,
    snapshotSaved,
    markAsRead,
    markAsUnread,
    restoreProgress,
    toggleUpdateOnly,
    showAllUpdates,
    jumpToSection,
    refreshDiff,
  };
}

export type ReadingProgressController = ReturnType<typeof useReadingProgress>;
