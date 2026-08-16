import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createArticleVersion,
  hasSubstantiveMarkdown,
  normalizeMarkdownContent,
} from '../../docs/.vitepress/theme/utils/articleVersion.ts';

test('忽略 frontmatter、空格、行尾和纯 Markdown 格式差异', () => {
  const first = `---\ntitle: 校园网\nupdated: 2026-08-16\n---\n\n## 收费标准\n\n每月 **20 元**。\n`;
  const second = `---\ntitle: 新标题\n---\r\n\r\n##   收费标准\r\n\r\n每月20元。\r\n`;

  assert.equal(createArticleVersion(first), createArticleVersion(second));
});

test('正文文字和链接目标变化会改变篇目版本', () => {
  const original = '## 办理方式\n\n请访问[服务大厅](https://example.com/old)。';
  const textChanged =
    '## 办理方式\n\n请前往[服务大厅](https://example.com/old)。';
  const linkChanged =
    '## 办理方式\n\n请访问[服务大厅](https://example.com/new)。';

  assert.notEqual(
    createArticleVersion(original),
    createArticleVersion(textChanged),
  );
  assert.notEqual(
    createArticleVersion(original),
    createArticleVersion(linkChanged),
  );
});

test('只含标题或 Vue 组件的工具页不算可追踪正文', () => {
  assert.equal(hasSubstantiveMarkdown('# 标题\n'), false);
  assert.equal(
    hasSubstantiveMarkdown(
      `<script setup>\nimport Tool from './Tool.vue'\n</script>\n\n<Tool />`,
    ),
    false,
  );
  assert.equal(hasSubstantiveMarkdown('# 标题\n\n这里是正文。'), true);
});

test('代码块内容保留在标准化版本中', () => {
  assert.match(
    normalizeMarkdownContent('```ts\nconst value = 1;\n```'),
    /const value = 1/,
  );
});
