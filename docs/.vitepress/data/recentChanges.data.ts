import simpleGit, { type SimpleGit } from 'simple-git';
import contributors from '../helpers/contributors';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import removeMarkdown from 'remove-markdown';

const DOCS_PREFIX = 'docs/';
const MD_SUFFIX = '.md';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const MAX_ITEMS = 30;

type Contributor = {
  name?: string;
  mapByNameAliases?: string[];
  mapByEmailAliases?: string[];
};

type Heading = {
  line: number;
  title: string;
  slug: string;
};

type SectionMatch = {
  title: string;
  slug: string;
  excerpt: string;
};

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/').trim();
}

function extractFiles(output: string): string[] {
  return output
    .split(/\r?\n/)
    .map((line) => normalizePath(line))
    .filter((line) => line.length > 0);
}

function isDocsMarkdown(filePath: string): boolean {
  return filePath.startsWith(DOCS_PREFIX) && filePath.endsWith(MD_SUFFIX);
}

function parseDate(dateValue: string): Date | null {
  const parsed = new Date(dateValue);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^]]+)]\([^)]+\)/g, '$1')
    .replace(/!\[([^]]*)]\([^)]+\)/g, '$1')
    .replace(/[*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(str: string): string {
  return str
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[ <>#%{"}|\\^~[\]`?/=:;@&+$,]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase();
}

function parseHeadings(lines: string[]): Heading[] {
  const slugs = new Map<string, number>();
  const headings: Heading[] = [];

  lines.forEach((line, index) => {
    const match = line.match(/^(#{2,6})\s+(.+?)\s*#*\s*$/);
    if (!match) {
      return;
    }

    const title = cleanInlineMarkdown(match[2]);
    if (!title) {
      return;
    }

    const baseSlug = slugify(title);
    if (!baseSlug) {
      return;
    }

    const count = slugs.get(baseSlug) ?? 0;
    slugs.set(baseSlug, count + 1);

    headings.push({
      line: index + 1,
      title,
      slug: count === 0 ? baseSlug : `${baseSlug}-${count}`,
    });
  });

  return headings;
}

function parseAddedLineNumbers(patch: string): number[] {
  const numbers: number[] = [];
  const lines = patch.split(/\r?\n/);
  let currentLine = 0;
  let inHunk = false;

  for (const line of lines) {
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (hunk) {
      currentLine = Number(hunk[1]);
      inHunk = true;
      continue;
    }

    if (!inHunk || line.startsWith('\\')) {
      continue;
    }

    if (line.startsWith('+')) {
      numbers.push(currentLine);
      currentLine += 1;
      continue;
    }

    if (line.startsWith(' ')) {
      currentLine += 1;
    }
  }

  return numbers;
}

function findHeadingForLine(
  headings: Heading[],
  lineNumber: number,
): Heading | null {
  let match: Heading | null = null;

  for (const heading of headings) {
    if (heading.line > lineNumber) {
      break;
    }

    match = heading;
  }

  return match;
}

function isExcerptCandidate(line: string): boolean {
  const trimmed = line.trim();
  return Boolean(
    trimmed &&
    !trimmed.startsWith('#') &&
    !trimmed.startsWith('---') &&
    !trimmed.startsWith('```') &&
    !trimmed.startsWith('|') &&
    !trimmed.startsWith('!['),
  );
}

function pickExcerpt(
  lines: string[],
  changedLines: number[],
  heading: Heading | null,
): string {
  for (const lineNumber of changedLines) {
    const line = lines[lineNumber - 1];
    if (!line) {
      continue;
    }

    if (isExcerptCandidate(line)) {
      return cleanInlineMarkdown(line).slice(0, 120);
    }
  }

  if (heading) {
    for (let i = heading.line; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line) {
        continue;
      }

      if (i + 1 !== heading.line && line.startsWith('#')) {
        break;
      }

      if (isExcerptCandidate(line)) {
        return cleanInlineMarkdown(line).slice(0, 120);
      }
    }
  }

  return '';
}

function pickSection(lines: string[], patch: string): SectionMatch | null {
  const headings = parseHeadings(lines);
  const changedLines = parseAddedLineNumbers(patch);
  const lineNumber = changedLines[0];

  if (!lineNumber) {
    return null;
  }

  const heading = findHeadingForLine(headings, lineNumber);
  const excerpt = pickExcerpt(lines, changedLines, heading);

  if (!heading && !excerpt) {
    return null;
  }

  return {
    title: heading?.title ?? '',
    slug: heading?.slug ?? '',
    excerpt,
  };
}

function buildContributorMap(list: Contributor[]): Map<string, Contributor> {
  const map = new Map<string, Contributor>();

  for (const contributor of list) {
    const aliases = [
      contributor.name,
      ...(contributor.mapByNameAliases ?? []),
      ...(contributor.mapByEmailAliases ?? []),
    ];

    for (const alias of aliases) {
      if (!alias) {
        continue;
      }

      map.set(alias.trim().toLowerCase(), contributor);
    }
  }

  return map;
}

function isMissingGitObject(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes('exists on disk, but not in') ||
    error.message.includes('does not exist in') ||
    (error.message.includes('Path') && error.message.includes('does not exist'))
  );
}

async function readFileAtCommit(
  git: SimpleGit,
  commitHash: string,
  filePath: string,
): Promise<string | null> {
  try {
    return await git.show([`${commitHash}:${filePath}`]);
  } catch (error) {
    if (isMissingGitObject(error)) {
      return null;
    }

    throw error;
  }
}

export default {
  async load() {
    try {
      const git = simpleGit({ baseDir: ROOT });
      const log = await git.log();
      const authorMap = buildContributorMap(contributors as Contributor[]);
      const fileUpdates = new Map<
        string,
        {
          path: string;
          updatedAt: string;
          authorName: string;
          sectionTitle: string;
          sectionSlug: string;
          excerpt: string;
        }
      >();

      for (const commit of log.all) {
        if (fileUpdates.size >= MAX_ITEMS) {
          break;
        }

        const updatedAt = parseDate(commit.date);

        if (!updatedAt) {
          continue;
        }

        const output = await git.show([
          commit.hash,
          '--name-only',
          '--pretty=format:',
        ]);

        for (const filePath of extractFiles(output)) {
          if (fileUpdates.size >= MAX_ITEMS) {
            break;
          }

          if (!isDocsMarkdown(filePath) || fileUpdates.has(filePath)) {
            continue;
          }

          const patch = await git.show([
            commit.hash,
            '--format=',
            '--unified=0',
            '--',
            filePath,
          ]);
          const contentAtCommit = await readFileAtCommit(
            git,
            commit.hash,
            filePath,
          );

          if (!contentAtCommit) {
            continue;
          }

          const lines = contentAtCommit.split(/\r?\n/);
          const section = pickSection(lines, patch);
          const contributor =
            authorMap.get(commit.author_name.trim().toLowerCase()) ??
            authorMap.get(commit.author_email.trim().toLowerCase());
          const excerpt = section?.excerpt
            ? removeMarkdown(section.excerpt)
                .replaceAll(/^:::+$/g, '')
                .replaceAll(/!!/g, '')
            : '';

          fileUpdates.set(filePath, {
            path: filePath,
            updatedAt: updatedAt.toISOString(),
            authorName: contributor?.name ?? commit.author_name,
            sectionTitle: section?.title ?? '',
            sectionSlug: section?.slug ?? '',
            excerpt,
          });
        }
      }

      return Array.from(fileUpdates.values()).toSorted(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    } catch (error) {
      console.warn('[recent-changes] Failed to read git history.', error);
      return [];
    }
  },
};
