import { getReadingStatus } from './readingStorage.ts';
import type {
  ArticleReadingState,
  ArticleVersionsData,
  ReadingState,
  ReadingStatus,
} from './readingTypes.ts';

export type ReadingFilter = 'all' | ReadingStatus;

export interface ReadingOverviewArticle {
  path: string;
  title: string;
  version: string;
  status: ReadingStatus;
  reading: ArticleReadingState;
}

export interface ReadingOverviewCounts {
  all: number;
  unread: number;
  reading: number;
  read: number;
  updated: number;
}

export function buildReadingOverviewArticles(
  versions: ArticleVersionsData,
  state: ReadingState,
): ReadingOverviewArticle[] {
  return Object.entries(versions)
    .map(([path, info]) => ({
      path,
      title: info.title,
      version: info.version,
      status: getReadingStatus(state.articles[path], info.version),
      reading: state.articles[path] ?? {},
    }))
    .sort((left, right) => left.title.localeCompare(right.title, 'zh-CN'));
}

export function countReadingOverview(
  articles: ReadingOverviewArticle[],
): ReadingOverviewCounts {
  return articles.reduce<ReadingOverviewCounts>(
    (counts, article) => {
      counts.all += 1;
      counts[article.status] += 1;
      return counts;
    },
    { all: 0, unread: 0, reading: 0, read: 0, updated: 0 },
  );
}

export function filterReadingOverview(
  articles: ReadingOverviewArticle[],
  filter: ReadingFilter,
): ReadingOverviewArticle[] {
  const filtered =
    filter === 'all'
      ? [...articles]
      : articles.filter((article) => article.status === filter);

  return filtered.sort((left, right) => {
    const timeDifference =
      (right.reading.lastOpenedAt ?? 0) - (left.reading.lastOpenedAt ?? 0);
    return timeDifference || left.title.localeCompare(right.title, 'zh-CN');
  });
}

export function recentlyReadArticles(
  articles: ReadingOverviewArticle[],
  limit = 6,
): ReadingOverviewArticle[] {
  return articles
    .filter((article) => article.reading.lastOpenedAt)
    .sort(
      (left, right) =>
        (right.reading.lastOpenedAt ?? 0) - (left.reading.lastOpenedAt ?? 0),
    )
    .slice(0, limit);
}
