import assert from 'node:assert/strict';
import test from 'node:test';
import {
  readArticleSnapshot,
  saveArticleSnapshot,
} from '../../docs/.vitepress/theme/utils/snapshotStorage.ts';

test('IndexedDB 不可用时安全降级', async () => {
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: undefined,
  });
  assert.equal(
    await saveArticleSnapshot({
      path: '/guide',
      version: 'v1',
      savedAt: 1,
      blocks: [],
    }),
    false,
  );
  assert.deepEqual(await readArticleSnapshot('/guide'), {
    available: false,
    snapshot: null,
  });
});
