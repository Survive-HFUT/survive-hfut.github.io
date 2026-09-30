import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalArticlePath } from '../../docs/.vitepress/theme/utils/articlePath.ts';

test('规范化 Markdown 文件路径和嵌套 index 页面', () => {
  assert.equal(canonicalArticlePath('docs/index.md'), '/');
  assert.equal(canonicalArticlePath('docs/foo/index.md'), '/foo');
  assert.equal(canonicalArticlePath('docs/foo/bar.md'), '/foo/bar');
});

test('规范化浏览器路由的后缀、尾斜杠、查询和锚点', () => {
  assert.equal(
    canonicalArticlePath('/foo/bar.html?from=test#part'),
    '/foo/bar',
  );
  assert.equal(canonicalArticlePath('/foo/bar///'), '/foo/bar');
  assert.equal(canonicalArticlePath('/foo/index.html#part'), '/foo');
});
