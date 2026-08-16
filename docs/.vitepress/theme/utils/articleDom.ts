import { hashText } from './articleVersion.ts';
import type {
  ArticleBlock,
  ArticleBlockType,
  ArticleChange,
} from './readingTypes.ts';

const BLOCK_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  '.custom-block',
  'blockquote',
  'pre',
  'table',
  'ul',
  'ol',
  'figure',
  'p',
  'img',
].join(',');

const IGNORED_SELECTOR = [
  '.reading-change-marker',
  '.reading-collapsed-run',
  '.vp-nolebase-page-properties',
  '.vp-nolebase-git-changelog',
  '.footnotes',
  '[data-reading-ignore]',
].join(',');

export interface DomArticleBlock extends ArticleBlock {
  element: HTMLElement;
}

export function findArticleRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.VPDoc main .vp-doc');
}

function normalizeDomText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function blockType(element: HTMLElement): ArticleBlockType {
  const tag = element.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) return 'heading';
  if (tag === 'ul' || tag === 'ol') return 'list';
  if (tag === 'table') return 'table';
  if (tag === 'blockquote') return 'blockquote';
  if (tag === 'pre') return 'code';
  if (tag === 'figure' || tag === 'img') return 'image';
  if (element.classList.contains('custom-block')) return 'container';
  if (
    element.querySelector('img') &&
    !normalizeDomText(element.textContent ?? '')
  ) {
    return 'image';
  }
  return 'paragraph';
}

function blockText(element: HTMLElement, type: ArticleBlockType): string {
  if (type === 'heading') {
    const clone = element.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll('.header-anchor')
      .forEach((anchor) => anchor.remove());
    return normalizeDomText(clone.textContent ?? '');
  }

  if (type === 'image') {
    const image =
      element.tagName === 'IMG'
        ? (element as HTMLImageElement)
        : element.querySelector('img');
    return normalizeDomText(
      `${image?.alt ?? ''} ${image?.getAttribute('src') ?? ''}`,
    );
  }

  if (type === 'code') {
    return (element.textContent ?? '').normalize('NFKC').trimEnd();
  }

  return normalizeDomText(element.textContent ?? '');
}

function blockSemanticText(
  element: HTMLElement,
  type: ArticleBlockType,
  text: string,
): string {
  if (type === 'code') return text;
  const links = Array.from(
    element.querySelectorAll<HTMLAnchorElement>('a[href]'),
  )
    .filter((link) => !link.classList.contains('header-anchor'))
    .map(
      (link) =>
        `链接:${normalizeDomText(link.textContent ?? '')}|${link.getAttribute('href') ?? ''}`,
    );
  const images = Array.from(
    element.querySelectorAll<HTMLImageElement>('img[src]'),
  ).map((image) => `图片:${image.alt}|${image.getAttribute('src') ?? ''}`);
  return [text, ...links, ...images].join('\n');
}

function hasBlockAncestor(element: HTMLElement, root: HTMLElement): boolean {
  let ancestor = element.parentElement;
  while (ancestor && ancestor !== root) {
    if (ancestor.matches(BLOCK_SELECTOR)) return true;
    ancestor = ancestor.parentElement;
  }
  return false;
}

export function extractArticleBlocks(
  root = findArticleRoot(),
): DomArticleBlock[] {
  if (!root) return [];

  const headingStack: string[] = [];
  const headingAnchors: Array<string | undefined> = [];
  const duplicateIds = new Map<string, number>();
  const blocks: DomArticleBlock[] = [];

  for (const node of root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)) {
    if (
      node.closest(IGNORED_SELECTOR) ||
      hasBlockAncestor(node, root) ||
      node.matches('h2#贡献者, h2#页面历史')
    ) {
      continue;
    }

    const type = blockType(node);
    const text = blockText(node, type);
    if (!text) continue;

    let level: number | undefined;
    if (type === 'heading') {
      level = Number(node.tagName.slice(1));
      headingStack.splice(level - 1);
      headingAnchors.splice(level - 1);
      headingStack[level - 1] = text;
      headingAnchors[level - 1] = node.id || undefined;
    }

    const headingPath = headingStack.filter(Boolean);
    const anchor = [...headingAnchors].reverse().find(Boolean);
    const baseId = hashText(`${type}|${headingPath.join('/')}|${text}`);
    const duplicate = duplicateIds.get(baseId) ?? 0;
    duplicateIds.set(baseId, duplicate + 1);
    const id = duplicate === 0 ? baseId : `${baseId}-${duplicate}`;

    blocks.push({
      id,
      type,
      headingPath,
      text,
      raw: blockSemanticText(node, type, text),
      level,
      anchor,
      element: node,
    });
  }

  return blocks;
}

export function serializableBlocks(blocks: DomArticleBlock[]): ArticleBlock[] {
  return blocks.map(({ element: _element, ...block }) => block);
}

function markerLabel(type: ArticleChange['type']): string {
  if (type === 'added') return '新增';
  if (type === 'modified') return '有修改';
  return '已删除';
}

function createText(tag: string, className: string, text: string): HTMLElement {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function createChangeMarker(change: ArticleChange): HTMLElement {
  const marker = document.createElement(
    change.type === 'added' ? 'div' : 'details',
  );
  marker.className = `reading-change-marker is-${change.type}`;
  marker.dataset.readingChange = change.type;

  if (change.type === 'added') {
    marker.append(createText('span', 'reading-change-badge', '新增'));
    return marker;
  }

  const summary = document.createElement('summary');
  summary.append(
    createText('span', 'reading-change-badge', markerLabel(change.type)),
    document.createTextNode(
      change.type === 'modified' ? ' 查看修改内容' : ' 查看已删除内容',
    ),
  );
  marker.append(summary);

  const comparison = document.createElement('div');
  comparison.className = 'reading-change-comparison';
  if (change.type === 'modified') {
    const oldText =
      change.oldBlock?.text === change.newBlock?.text
        ? (change.oldBlock?.raw ?? change.oldBlock?.text ?? '')
        : (change.oldBlock?.text ?? '');
    const newText =
      change.oldBlock?.text === change.newBlock?.text
        ? (change.newBlock?.raw ?? change.newBlock?.text ?? '')
        : (change.newBlock?.text ?? '');
    comparison.append(
      createText('div', 'reading-change-old', `原内容：${oldText}`),
      createText('div', 'reading-change-new', `现内容：${newText}`),
    );
  } else {
    comparison.append(
      createText('del', 'reading-change-old', change.oldBlock?.text ?? ''),
    );
  }
  marker.append(comparison);
  return marker;
}

export function clearArticleChangePresentation(root = findArticleRoot()): void {
  root
    ?.querySelectorAll('.reading-change-marker, .reading-collapsed-run')
    .forEach((element) => element.remove());
  root
    ?.querySelectorAll<HTMLElement>('[data-reading-block-index]')
    .forEach((element) => {
      delete element.dataset.readingBlockIndex;
      element.classList.remove(
        'reading-block-added',
        'reading-block-modified',
        'reading-block-unchanged',
        'is-collapsed',
      );
    });
  root?.classList.remove('reading-update-only');
  document
    .querySelectorAll('.reading-outline-updated')
    .forEach((element) => element.classList.remove('reading-outline-updated'));
}

function deletedInsertionTarget(
  change: ArticleChange,
  blocks: DomArticleBlock[],
): HTMLElement | null {
  if (change.anchor) {
    const heading = blocks.find(
      (block) => block.type === 'heading' && block.element.id === change.anchor,
    );
    if (heading) return heading.element;
  }

  return blocks.at(-1)?.element ?? null;
}

export function renderArticleChanges(
  root: HTMLElement,
  blocks: DomArticleBlock[],
  changes: ArticleChange[],
): void {
  clearArticleChangePresentation(root);
  blocks.forEach((block, index) => {
    block.element.dataset.readingBlockIndex = String(index);
  });

  for (const change of changes) {
    const marker = createChangeMarker(change);
    if (change.newIndex !== undefined) {
      const target = blocks[change.newIndex]?.element;
      if (!target) continue;
      target.before(marker);
      target.classList.add(
        change.type === 'added'
          ? 'reading-block-added'
          : 'reading-block-modified',
      );
      continue;
    }

    const target = deletedInsertionTarget(change, blocks);
    if (target) target.after(marker);
    else root.append(marker);
  }

  const changedAnchors = new Set(
    changes.map((change) => change.anchor).filter(Boolean),
  );
  for (const anchor of changedAnchors) {
    document
      .querySelectorAll<HTMLAnchorElement>(
        `.VPDocAsideOutline a[href="#${CSS.escape(anchor as string)}"]`,
      )
      .forEach((link) => link.classList.add('reading-outline-updated'));
  }
}

export function setUpdateOnlyMode(
  root: HTMLElement,
  blocks: DomArticleBlock[],
  changes: ArticleChange[],
  enabled: boolean,
): void {
  root
    .querySelectorAll('.reading-collapsed-run')
    .forEach((element) => element.remove());
  blocks.forEach((block) =>
    block.element.classList.remove('reading-block-unchanged', 'is-collapsed'),
  );
  root.classList.toggle('reading-update-only', enabled);
  if (!enabled) return;

  const changedIndexes = new Set(
    changes
      .map((change) => change.newIndex)
      .filter((index): index is number => index !== undefined),
  );
  let run: DomArticleBlock[] = [];

  const finishRun = () => {
    if (run.length === 0) return;
    const currentRun = [...run];
    const placeholder = document.createElement('button');
    placeholder.type = 'button';
    placeholder.className = 'reading-collapsed-run';
    placeholder.textContent = `展开 ${currentRun.length} 段未变化内容`;
    placeholder.addEventListener('click', () => {
      currentRun.forEach((block) =>
        block.element.classList.remove('is-collapsed'),
      );
      placeholder.remove();
    });
    currentRun[0].element.before(placeholder);
    run = [];
  };

  blocks.forEach((block, index) => {
    const shouldCollapse =
      block.type !== 'heading' && !changedIndexes.has(index);
    if (!shouldCollapse) {
      finishRun();
      return;
    }

    block.element.classList.add('reading-block-unchanged', 'is-collapsed');
    run.push(block);
  });
  finishRun();
}

export function scrollToFirstChange(root = findArticleRoot()): void {
  root
    ?.querySelector<HTMLElement>('.reading-change-marker')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
