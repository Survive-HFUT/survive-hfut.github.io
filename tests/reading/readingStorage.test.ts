import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getReadingStatus,
  readReadingState,
  recordArticleVisit,
  READING_STORAGE_KEY,
  updateArticleReadingState,
} from '../../docs/.vitepress/theme/utils/readingStorage.ts';

function installStorage() {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { dispatchEvent: () => true },
  });
  return values;
}

test('访问文章只记录访问，不覆盖最后确认已读版本', () => {
  const values = installStorage();
  updateArticleReadingState('/guide/index.md', () => ({
    readVersion: 'old-version',
    readAt: 1,
  }));
  recordArticleVisit('/guide/', 2);
  const article = readReadingState().articles['/guide'];
  assert.equal(article.readVersion, 'old-version');
  assert.equal(article.lastOpenedAt, 2);
  assert.equal(getReadingStatus(article, 'new-version'), 'updated');
  assert.ok(values.has(READING_STORAGE_KEY));
});

test('localStorage 不可写时返回降级状态而不抛错', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    },
  });
  const result = recordArticleVisit('/guide');
  assert.equal(result.saved, false);
});
