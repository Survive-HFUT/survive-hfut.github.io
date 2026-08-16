import assert from 'node:assert/strict';
import test from 'node:test';
import {
  diffArticleBlocks,
  summarizeChanges,
} from '../../docs/.vitepress/theme/utils/articleDiff.ts';
import type { ArticleBlock } from '../../docs/.vitepress/theme/utils/readingTypes.ts';

function block(
  text: string,
  options: Partial<ArticleBlock> = {},
): ArticleBlock {
  return {
    id: options.id ?? text,
    type: options.type ?? 'paragraph',
    headingPath: options.headingPath ?? ['收费标准'],
    text,
    ...options,
  };
}

test('把局部日期调整识别为修改，而不是删除加新增', () => {
  const changes = diffArticleBlocks(
    [block('体育课退选截止为 9 月 15 日。')],
    [block('体育课退选截止为 9 月 18 日。')],
  );

  assert.equal(changes.length, 1);
  assert.equal(changes[0].type, 'modified');
  assert.ok((changes[0].similarity ?? 0) > 0.7);
});

test('以用户快照直接对比当前版本，保留跨多次更新的全部变化', () => {
  const userSnapshot = [
    block('认证方式：账号密码'),
    block('服务时间：08:00–17:00'),
  ];
  const current = [
    block('认证方式：统一身份认证'),
    block('服务时间：08:30–17:30'),
    block('首次登录需要绑定手机号'),
  ];
  const summary = summarizeChanges(diffArticleBlocks(userSnapshot, current));

  assert.deepEqual(summary, { added: 1, modified: 2, deleted: 0 });
});

test('区分新增、删除并保留所在章节', () => {
  const oldBlocks = [
    block('校园卡服务中心周六上午开放。', {
      headingPath: ['校园卡', '服务时间'],
      anchor: '服务时间',
    }),
  ];
  const newBlocks = [
    block('工作日可在服务大厅办理。', {
      headingPath: ['校园卡', '办理地点'],
      anchor: '办理地点',
    }),
  ];
  const changes = diffArticleBlocks(oldBlocks, newBlocks);
  const summary = summarizeChanges(changes);

  assert.deepEqual(summary, { added: 1, modified: 0, deleted: 1 });
  assert.equal(
    changes.find((change) => change.type === 'deleted')?.section,
    '服务时间',
  );
});

test('相同正文块不会产生更新', () => {
  const blocks = [
    block('收费标准', { type: 'heading', level: 2 }),
    block('每月收费 20 元。'),
  ];

  assert.deepEqual(diffArticleBlocks(blocks, structuredClone(blocks)), []);
});

test('显示文字相同但链接目标变化时仍识别为修改', () => {
  const oldBlock = block('请访问服务大厅。', {
    raw: '请访问服务大厅。\n链接:服务大厅|https://example.com/old',
  });
  const newBlock = block('请访问服务大厅。', {
    raw: '请访问服务大厅。\n链接:服务大厅|https://example.com/new',
  });
  const changes = diffArticleBlocks([oldBlock], [newBlock]);

  assert.equal(changes.length, 1);
  assert.equal(changes[0].type, 'modified');
});
