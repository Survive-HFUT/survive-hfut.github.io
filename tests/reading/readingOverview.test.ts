import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildReadingOverviewArticles,
  countReadingOverview,
  filterReadingOverview,
  recentlyReadArticles,
} from '../../docs/.vitepress/theme/utils/readingOverview.ts';
import type {
  ArticleVersionsData,
  ReadingState,
} from '../../docs/.vitepress/theme/utils/readingTypes.ts';

const versions: ArticleVersionsData = {
  '/new': { title: '未读篇目', version: 'v1' },
  '/progress': { title: '阅读中篇目', version: 'v1' },
  '/read': { title: '已读篇目', version: 'v2' },
  '/updated': { title: '更新篇目', version: 'v4' },
};

const state: ReadingState = {
  version: 1,
  lastVisited: '/progress',
  articles: {
    '/progress': { scrollProgress: 0.42, lastOpenedAt: 400 },
    '/read': { readVersion: 'v2', readAt: 200, lastOpenedAt: 300 },
    '/updated': { readVersion: 'v1', readAt: 100, lastOpenedAt: 200 },
  },
};

test('生成四种阅读状态并统计篇目数量', () => {
  const articles = buildReadingOverviewArticles(versions, state);
  assert.deepEqual(countReadingOverview(articles), {
    all: 4,
    unread: 1,
    reading: 1,
    read: 1,
    updated: 1,
  });
});

test('筛选有更新篇目', () => {
  const articles = buildReadingOverviewArticles(versions, state);
  const updated = filterReadingOverview(articles, 'updated');

  assert.deepEqual(
    updated.map((article) => article.path),
    ['/updated'],
  );
});

test('最近阅读按打开时间倒序排列', () => {
  const articles = buildReadingOverviewArticles(versions, state);
  const recent = recentlyReadArticles(articles, 2);

  assert.deepEqual(
    recent.map((article) => article.path),
    ['/progress', '/read'],
  );
});
