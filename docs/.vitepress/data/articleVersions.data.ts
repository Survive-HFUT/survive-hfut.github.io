import { readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineLoader } from 'vitepress';
import {
  createArticleVersion,
  hasSubstantiveMarkdown,
} from '../theme/utils/articleVersion.ts';
import type { ArticleVersionsData } from '../theme/utils/readingTypes.ts';

const DATA_DIR = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = resolve(DATA_DIR, '../..');
const UTILITY_PAGES = new Set(['/ongoing', '/random', '/recent_update']);

declare const data: ArticleVersionsData;
export { data };

function toRoute(file: string): string {
  const relativePath = relative(DOCS_DIR, file).split(sep).join('/');
  const withoutExtension = relativePath.replace(/\.md$/i, '');
  if (withoutExtension === 'index') return '/';
  return `/${withoutExtension}`.replace(/\/{2,}/g, '/').replace(/\/$/, '');
}

function isExcluded(route: string, markdown: string): boolean {
  return (
    route === '/' ||
    route.startsWith('/about') ||
    route.startsWith('/achievements') ||
    UTILITY_PAGES.has(route) ||
    /^---\r?\n[\s\S]*?^exclude:\s*true\s*$[\s\S]*?^---/m.test(markdown) ||
    !hasSubstantiveMarkdown(markdown)
  );
}

export default defineLoader({
  watch: '../../**/*.md',
  load(watchedFiles): ArticleVersionsData {
    const versions: ArticleVersionsData = {};

    for (const file of watchedFiles) {
      const markdown = readFileSync(file, 'utf8');
      const route = toRoute(file);
      if (isExcluded(route, markdown)) {
        continue;
      }

      versions[route] = { version: createArticleVersion(markdown) };
    }

    return versions;
  },
});
