import type { ArticleBlock, ArticleChange } from './readingTypes.ts';

function normalizeText(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')
    .replace(/\s+/g, '')
    .replace(/[，。！？；：、“”‘’（）()《》【】\[\],.!?;:'"`]/g, '');
}

function bigrams(value: string): Map<string, number> {
  const grams = new Map<string, number>();
  if (value.length < 2) {
    if (value) grams.set(value, 1);
    return grams;
  }

  for (let index = 0; index < value.length - 1; index += 1) {
    const gram = value.slice(index, index + 2);
    grams.set(gram, (grams.get(gram) ?? 0) + 1);
  }

  return grams;
}

export function textSimilarity(first: string, second: string): number {
  const left = normalizeText(first);
  const right = normalizeText(second);
  if (left === right) return 1;
  if (!left || !right) return 0;

  const leftGrams = bigrams(left);
  const rightGrams = bigrams(right);
  let intersection = 0;
  let leftSize = 0;
  let rightSize = 0;

  for (const count of leftGrams.values()) leftSize += count;
  for (const count of rightGrams.values()) rightSize += count;
  for (const [gram, count] of leftGrams) {
    intersection += Math.min(count, rightGrams.get(gram) ?? 0);
  }

  return (2 * intersection) / (leftSize + rightSize);
}

function sectionText(block: ArticleBlock): string {
  return block.headingPath.join(' / ');
}

function comparableText(block: ArticleBlock): string {
  return block.raw ?? block.text;
}

function exactKey(block: ArticleBlock): string {
  return `${block.type}|${normalizeText(sectionText(block))}|${normalizeText(comparableText(block))}`;
}

function candidateScore(
  oldBlock: ArticleBlock,
  newBlock: ArticleBlock,
  oldIndex: number,
  newIndex: number,
  oldLength: number,
  newLength: number,
): { score: number; text: number } {
  if (oldBlock.type !== newBlock.type) {
    return { score: 0, text: 0 };
  }

  const text = textSimilarity(
    comparableText(oldBlock),
    comparableText(newBlock),
  );
  // 同一章节、相近位置的“字段：值”类段落即使值整体替换，也应优先
  // 识别为修改；章节和位置权重会阻止无关段落仅凭低相似度配对。
  if (text < 0.32) {
    return { score: 0, text };
  }

  const section = textSimilarity(sectionText(oldBlock), sectionText(newBlock));
  const oldPosition = oldLength > 1 ? oldIndex / (oldLength - 1) : 0;
  const newPosition = newLength > 1 ? newIndex / (newLength - 1) : 0;
  const proximity = 1 - Math.min(1, Math.abs(oldPosition - newPosition));
  return { score: text * 0.72 + section * 0.2 + proximity * 0.08, text };
}

function resolveDeletedAnchor(
  oldBlock: ArticleBlock,
  currentBlocks: ArticleBlock[],
): string | undefined {
  if (
    oldBlock.anchor &&
    currentBlocks.some((block) => block.anchor === oldBlock.anchor)
  ) {
    return oldBlock.anchor;
  }

  const oldSection = oldBlock.headingPath.at(-1) ?? '';
  let best: { similarity: number; anchor?: string } | undefined;
  for (const block of currentBlocks) {
    if (block.type !== 'heading' || !block.anchor) continue;
    const similarity = textSimilarity(oldSection, block.text);
    if (!best || similarity > best.similarity) {
      best = { similarity, anchor: block.anchor };
    }
  }

  return best && best.similarity >= 0.45 ? best.anchor : undefined;
}

export function diffArticleBlocks(
  oldBlocks: ArticleBlock[],
  newBlocks: ArticleBlock[],
): ArticleChange[] {
  const oldMatched = new Set<number>();
  const newMatched = new Set<number>();
  const exactMatches = new Map<string, number[]>();
  const changes: ArticleChange[] = [];

  newBlocks.forEach((block, index) => {
    const key = exactKey(block);
    const indexes = exactMatches.get(key) ?? [];
    indexes.push(index);
    exactMatches.set(key, indexes);
  });

  oldBlocks.forEach((block, oldIndex) => {
    const candidates = exactMatches.get(exactKey(block));
    const newIndex = candidates?.find((index) => !newMatched.has(index));
    if (newIndex === undefined) return;
    oldMatched.add(oldIndex);
    newMatched.add(newIndex);
  });

  const candidates: Array<{
    oldIndex: number;
    newIndex: number;
    score: number;
    text: number;
  }> = [];

  oldBlocks.forEach((oldBlock, oldIndex) => {
    if (oldMatched.has(oldIndex)) return;
    newBlocks.forEach((newBlock, newIndex) => {
      if (newMatched.has(newIndex)) return;
      const { score, text } = candidateScore(
        oldBlock,
        newBlock,
        oldIndex,
        newIndex,
        oldBlocks.length,
        newBlocks.length,
      );
      const threshold = oldBlock.type === 'heading' ? 0.56 : 0.5;
      if (score >= threshold) {
        candidates.push({ oldIndex, newIndex, score, text });
      }
    });
  });

  candidates.sort((left, right) => right.score - left.score);
  for (const candidate of candidates) {
    if (
      oldMatched.has(candidate.oldIndex) ||
      newMatched.has(candidate.newIndex)
    ) {
      continue;
    }

    oldMatched.add(candidate.oldIndex);
    newMatched.add(candidate.newIndex);
    const oldBlock = oldBlocks[candidate.oldIndex];
    const newBlock = newBlocks[candidate.newIndex];
    changes.push({
      type: 'modified',
      section: newBlock.headingPath.at(-1) ?? newBlock.text,
      anchor: newBlock.anchor,
      oldBlock,
      newBlock,
      oldIndex: candidate.oldIndex,
      newIndex: candidate.newIndex,
      similarity: candidate.text,
    });
  }

  newBlocks.forEach((newBlock, newIndex) => {
    if (newMatched.has(newIndex)) return;
    changes.push({
      type: 'added',
      section: newBlock.headingPath.at(-1) ?? newBlock.text,
      anchor: newBlock.anchor,
      newBlock,
      newIndex,
    });
  });

  oldBlocks.forEach((oldBlock, oldIndex) => {
    if (oldMatched.has(oldIndex)) return;
    changes.push({
      type: 'deleted',
      section: oldBlock.headingPath.at(-1) ?? oldBlock.text,
      anchor: resolveDeletedAnchor(oldBlock, newBlocks),
      oldBlock,
      oldIndex,
    });
  });

  return changes.sort((left, right) => {
    const leftIndex = left.newIndex ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = right.newIndex ?? Number.MAX_SAFE_INTEGER;
    if (leftIndex !== rightIndex) return leftIndex - rightIndex;
    return (left.oldIndex ?? 0) - (right.oldIndex ?? 0);
  });
}

export function summarizeChanges(changes: ArticleChange[]) {
  return changes.reduce(
    (summary, change) => {
      summary[change.type] += 1;
      return summary;
    },
    { added: 0, modified: 0, deleted: 0 },
  );
}
