import type {
  ArticleReadingState,
  ReadingState,
  ReadingStatus,
} from './readingTypes.ts';

export const READING_STORAGE_KEY = 'survive-hfut:reading:v1';
export const READING_STATE_EVENT = 'survive-hfut:reading-state-change';

function emptyState(): ReadingState {
  return { version: 1, articles: {} };
}

export function normalizeReadingPath(path: string): string {
  const clean = path.split(/[?#]/, 1)[0].replace(/\.html$/, '');
  if (!clean || clean === '/') {
    return '/';
  }

  return `/${clean.replace(/^\/+|\/+$/g, '')}`;
}

function sanitizeArticle(value: unknown): ArticleReadingState {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const input = value as Record<string, unknown>;
  const output: ArticleReadingState = {};
  const stringKeys = ['readVersion', 'lastHeading', 'lastAnchor'] as const;
  const numberKeys = [
    'readAt',
    'lastOpenedAt',
    'scrollProgress',
    'headingProgress',
  ] as const;

  for (const key of stringKeys) {
    if (typeof input[key] === 'string') {
      output[key] = input[key];
    }
  }

  for (const key of numberKeys) {
    if (typeof input[key] === 'number' && Number.isFinite(input[key])) {
      output[key] = input[key];
    }
  }

  return output;
}

export function migrateReadingState(value: unknown): ReadingState {
  if (!value || typeof value !== 'object') {
    return emptyState();
  }

  const input = value as Record<string, unknown>;
  if (
    input.version !== 1 ||
    !input.articles ||
    typeof input.articles !== 'object'
  ) {
    return emptyState();
  }

  const state = emptyState();
  if (typeof input.lastVisited === 'string') {
    state.lastVisited = normalizeReadingPath(input.lastVisited);
  }

  for (const [path, article] of Object.entries(
    input.articles as Record<string, unknown>,
  )) {
    state.articles[normalizeReadingPath(path)] = sanitizeArticle(article);
  }

  return state;
}

export function readReadingState(): ReadingState {
  if (typeof localStorage === 'undefined') {
    return emptyState();
  }

  try {
    const stored = localStorage.getItem(READING_STORAGE_KEY);
    return stored ? migrateReadingState(JSON.parse(stored)) : emptyState();
  } catch {
    return emptyState();
  }
}

export function writeReadingState(state: ReadingState): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(READING_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(READING_STATE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function clearReadingState(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(READING_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(READING_STATE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function updateArticleReadingState(
  path: string,
  update: (article: ArticleReadingState) => ArticleReadingState,
): ReadingState {
  const state = readReadingState();
  const normalizedPath = normalizeReadingPath(path);
  state.articles[normalizedPath] = update({
    ...(state.articles[normalizedPath] ?? {}),
  });
  writeReadingState(state);
  return state;
}

export function getReadingStatus(
  article: ArticleReadingState | undefined,
  currentVersion: string,
): ReadingStatus {
  if (article?.readVersion) {
    return article.readVersion === currentVersion ? 'read' : 'updated';
  }

  return (article?.scrollProgress ?? 0) >= 0.02 ? 'reading' : 'unread';
}

export function recordArticleVisit(
  path: string,
  now = Date.now(),
): ReadingState {
  const state = readReadingState();
  const normalizedPath = normalizeReadingPath(path);
  state.lastVisited = normalizedPath;
  state.articles[normalizedPath] = {
    ...(state.articles[normalizedPath] ?? {}),
    lastOpenedAt: now,
  };
  writeReadingState(state);
  return state;
}
