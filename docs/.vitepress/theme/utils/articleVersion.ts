const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

export function hashText(value: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^\uFEFF/, '').replace(FRONTMATTER_RE, '');
}

function normalizeInlineMarkdown(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/!\[([^\]]*)]\(([^)]+)\)/g, '图片:$1|$2')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '链接:$1|$2')
    .replace(/\[([^\]]+)]\[([^\]]*)]/g, '链接:$1|$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[\s*_~]+/g, '')
    .trim();
}

/**
 * Produces a stable, semantic-ish representation of Markdown. It intentionally
 * ignores line endings, wrapping, emphasis markers, list marker style and
 * table alignment, while retaining headings, visible text and link targets.
 */
export function normalizeMarkdownContent(markdown: string): string {
  const source = stripFrontmatter(markdown)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/\r\n?/g, '\n');
  const semanticParts: string[] = [];
  let fence = '';
  let code = '';

  for (const sourceLine of source.split('\n')) {
    const trimmed = sourceLine.trim();
    const fenceMatch = trimmed.match(/^(```+|~~~+)/);

    if (fence) {
      if (fenceMatch?.[1].startsWith(fence[0])) {
        semanticParts.push(`代码:${code.trimEnd()}`);
        fence = '';
        code = '';
      } else {
        code += `${sourceLine.replace(/[ \t]+$/g, '')}\n`;
      }
      continue;
    }

    if (fenceMatch) {
      fence = fenceMatch[1];
      continue;
    }

    if (
      !trimmed ||
      /^:{3,}\s*$/.test(trimmed) ||
      /^:{3,}\w+/.test(trimmed) ||
      /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed) ||
      /^<[A-Z][\w.-]*(?:\s[^>]*)?\s*\/?>(?:<\/[A-Z][\w.-]*>)?$/.test(trimmed)
    ) {
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      semanticParts.push(
        `标题${heading[1].length}:${normalizeInlineMarkdown(heading[2])}`,
      );
      continue;
    }

    const normalized = normalizeInlineMarkdown(
      trimmed
        .replace(/^>+\s*/, '')
        .replace(/^[-+*]\s+/, '')
        .replace(/^\d+[.)]\s+/, ''),
    );
    if (normalized) {
      semanticParts.push(normalized);
    }
  }

  if (code) {
    semanticParts.push(`代码:${code.trimEnd()}`);
  }

  return semanticParts.join('\n');
}

export function createArticleVersion(markdown: string): string {
  return hashText(normalizeMarkdownContent(markdown));
}

export function hasSubstantiveMarkdown(markdown: string): boolean {
  const normalized = normalizeMarkdownContent(markdown);
  return normalized
    .split('\n')
    .some((part) => part.length > 0 && !part.startsWith('标题'));
}
