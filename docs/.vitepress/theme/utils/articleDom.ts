import type { ArticleBlock, ArticleBlockType } from './readingTypes.ts';

const BLOCK_SELECTOR =
  'h1,h2,h3,h4,h5,h6,.custom-block,blockquote,pre,table,ul,ol,figure,p,img';
const IGNORED_SELECTOR =
  '.vp-nolebase-page-properties,.vp-nolebase-git-changelog,.footnotes,[data-reading-ignore]';

export interface DomArticleBlock extends ArticleBlock {
  element: HTMLElement;
}

export function findArticleRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.VPDoc main .vp-doc');
}

const normalizeText = (value: string) =>
  value
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function typeOf(element: HTMLElement): ArticleBlockType {
  const tag = element.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) return 'heading';
  if (tag === 'ul' || tag === 'ol') return 'list';
  if (tag === 'table') return 'table';
  if (tag === 'blockquote') return 'blockquote';
  if (tag === 'pre') return 'code';
  if (tag === 'figure' || tag === 'img') return 'image';
  if (element.classList.contains('custom-block')) return 'container';
  return 'paragraph';
}

function hasBlockAncestor(element: HTMLElement, root: HTMLElement): boolean {
  let ancestor = element.parentElement;
  while (ancestor && ancestor !== root) {
    if (ancestor.matches(BLOCK_SELECTOR)) return true;
    ancestor = ancestor.parentElement;
  }
  return false;
}

function textOf(element: HTMLElement, type: ArticleBlockType): string {
  if (type === 'image') {
    const image =
      element.tagName === 'IMG'
        ? (element as HTMLImageElement)
        : element.querySelector('img');
    return normalizeText(
      `${image?.alt ?? ''} ${image?.getAttribute('src') ?? ''}`,
    );
  }
  if (type === 'heading') {
    const clone = element.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll('.header-anchor')
      .forEach((anchor) => anchor.remove());
    return normalizeText(clone.textContent ?? '');
  }
  return type === 'code'
    ? (element.textContent ?? '').normalize('NFKC').trimEnd()
    : normalizeText(element.textContent ?? '');
}

export function extractArticleBlocks(
  root = findArticleRoot(),
): DomArticleBlock[] {
  if (!root) return [];
  const headingStack: string[] = [];
  const headingAnchors: Array<string | undefined> = [];
  const blocks: DomArticleBlock[] = [];
  for (const element of root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)) {
    if (
      element.closest(IGNORED_SELECTOR) ||
      hasBlockAncestor(element, root) ||
      element.matches('h2#贡献者,h2#页面历史')
    )
      continue;
    const type = typeOf(element);
    const text = textOf(element, type);
    if (!text) continue;
    let level: number | undefined;
    if (type === 'heading') {
      level = Number(element.tagName.slice(1));
      headingStack.splice(level - 1);
      headingAnchors.splice(level - 1);
      headingStack[level - 1] = text;
      headingAnchors[level - 1] = element.id || undefined;
    }
    const links = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('a[href]'),
    )
      .filter((link) => !link.classList.contains('header-anchor'))
      .map(
        (link) =>
          `链接:${normalizeText(link.textContent ?? '')}|${link.getAttribute('href') ?? ''}`,
      );
    const images = Array.from(
      element.querySelectorAll<HTMLImageElement>('img[src]'),
    ).map((image) => `图片:${image.alt}|${image.getAttribute('src') ?? ''}`);
    blocks.push({
      id: `${type}-${blocks.length}`,
      type,
      headingPath: headingStack.filter(Boolean),
      text,
      raw: [text, ...links, ...images].join('\n'),
      level,
      anchor: [...headingAnchors].reverse().find(Boolean),
      element,
    });
  }
  return blocks;
}

export function serializableBlocks(blocks: DomArticleBlock[]): ArticleBlock[] {
  return blocks.map(({ element: _element, ...block }) => block);
}
